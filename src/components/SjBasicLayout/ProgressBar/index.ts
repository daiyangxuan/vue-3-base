import "./progressBar.less";

interface ProgressBarOptions {
  minimum: number;
  template: string;
  easing: string;
  speed: number;
  trickle: boolean;
  trickleRate: number;
  trickleSpeed: number;
  showSpinner: boolean;
  parent: HTMLElement;
  positionUsing: string;
  barSelector: string;
  spinnerSelector: string;
}

interface IProgressBar {
  version: string;
  settings: ProgressBarOptions;
  status: number | null;

  configure(options: Partial<ProgressBarOptions>): ProgressBar;
  set(number: number): ProgressBar;
  isStarted(): boolean;
  start(): ProgressBar;
  done(force?: boolean): ProgressBar;
  inc(amount?: number): ProgressBar;
  trickle(): ProgressBar;

  /* Internal */

  render(fromStart?: boolean): HTMLElement;
  remove(): void;
  isRendered(): boolean;
  getPositioningCSS(): "translate3d" | "translate" | "margin";
}

function classList(element: Element) {
  return (" " + (element.className || "") + " ").replace(/\s+/gi, " ");
}

function removeClass(element: Element, name: string) {
  const oldList = classList(element);

  if (!hasClass(element, name)) return;

  // Replace the class name.
  const newList = oldList.replace(" " + name + " ", " ");

  // Trim the opening and closing spaces.
  element.className = newList.substring(1, newList.length - 1);
}

function hasClass(element: Element | string, name: string) {
  const list = typeof element == "string" ? element : classList(element);
  return list.indexOf(" " + name + " ") >= 0;
}

/**
 * (Internal) Adds a class to an element.
 */

function addClass(element: Element, name: string) {
  const oldList = classList(element);
  const newList = oldList + name;

  if (hasClass(oldList, name)) return;

  // Trim the opening space.
  element.className = newList.substring(1);
}

function removeElement(element: Element) {
  element && element.parentNode && element.parentNode.removeChild(element);
}

function toBarPerc(n: number) {
  return (-1 + n) * 100;
}

function clamp(n: number, min: number, max: number) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

const css = (function () {
  const cssPrefixes = ["Webkit", "O", "Moz", "ms"];
  const cssProps: Record<string, any> = {};

  function camelCase(string: string) {
    return string
      .replace(/^-ms-/, "ms-")
      .replace(/-([\da-z])/gi, function (match, letter) {
        return letter.toUpperCase();
      });
  }

  function getVendorProp(name: string) {
    const style = document.body.style;
    if (name in style) return name;

    let i = cssPrefixes.length;
    const capName = name.charAt(0).toUpperCase() + name.slice(1);
    let vendorName;
    while (i--) {
      vendorName = cssPrefixes[i] + capName;
      if (vendorName in style) return vendorName;
    }

    return name;
  }

  function getStyleProp(name: string) {
    name = camelCase(name);
    return cssProps[name] || (cssProps[name] = getVendorProp(name));
  }

  function applyCss(element: HTMLElement, prop: string, value: string) {
    prop = getStyleProp(prop);
    element.style[prop as any] = value;
  }

  return function (
    element: HTMLElement,
    properties: Record<string, any>,
    ...rest: any[]
  ) {
    const args = [element, properties, ...rest];

    if (args.length == 2) {
      for (const prop in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, prop)) {
          const value = properties[prop];
          if (value !== undefined) {
            applyCss(element, prop, value);
          }
        }
      }
    } else {
      applyCss(element, args[1], args[2]);
    }
  };
})();

const queue = (function () {
  const pending: Array<(next: () => void) => void> = [];

  function next() {
    const fn = pending.shift();
    if (fn) {
      fn(next);
    }
  }

  return function (fn: (next: () => void) => void) {
    pending.push(fn);
    if (pending.length == 1) next();
  };
})();

export default class ProgressBar implements IProgressBar {
  settings: ProgressBarOptions = {
    minimum: 0.08,
    easing: "ease",
    positionUsing: "",
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    parent: document.body,
    template:
      '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
  };
  status: number | null = null;
  version = "0.2.0";

  static PROGRESS_ELEMENT_ID = "progress-bar";

  configure(options: Partial<ProgressBarOptions>): this {
    this.settings = {
      ...this.settings,
      ...options,
    };
    return this;
  }

  done(force?: boolean): this {
    if (!force && !this.status) return this;

    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  }

  getPositioningCSS(): "translate3d" | "translate" | "margin" {
    // Sniff on document.body.style
    const bodyStyle = document.body.style;

    // Sniff prefixes
    const vendorPrefix =
      "WebkitTransform" in bodyStyle
        ? "Webkit"
        : "MozTransform" in bodyStyle
        ? "Moz"
        : "msTransform" in bodyStyle
        ? "ms"
        : "OTransform" in bodyStyle
        ? "O"
        : "";

    if (vendorPrefix + "Perspective" in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return "translate3d";
    } else if (vendorPrefix + "Transform" in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return "translate";
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return "margin";
    }
  }

  inc(amount?: number): this {
    let n = this.status;

    if (!n) {
      return this.start();
    } else {
      if (typeof amount !== "number") {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return this.set(n);
    }
  }

  isRendered(): boolean {
    return !!this.getProgress();
  }

  isStarted(): boolean {
    return typeof this.status === "number";
  }

  private getProgress(): Element | null {
    return this.settings.parent.querySelector(
      `#${ProgressBar.PROGRESS_ELEMENT_ID}`
    );
  }

  remove(): void {
    // removeClass(document.documentElement, "router-view-progress-busy");
    removeClass(this.settings.parent, "progress-bar-custom-parent");
    const progress = this.getProgress();
    progress && removeElement(progress);
  }

  render(fromStart?: boolean): HTMLElement {
    if (this.isRendered()) {
      return this.getProgress() as HTMLElement;
    }
    // addClass(document.documentElement, "router-view-progress-busy");

    const progress = document.createElement("div");
    progress.id = ProgressBar.PROGRESS_ELEMENT_ID;
    progress.innerHTML = this.settings.template;

    const bar = progress.querySelector(this.settings.barSelector);
    const perc = fromStart ? "-100" : toBarPerc(this.status || 0);
    const parent = this.settings.parent;

    css(bar as HTMLElement, {
      transition: "all 0 linear",
      transform: "translate3d(" + perc + "%,0,0)",
    });

    if (!this.settings.showSpinner) {
      const spinner = progress.querySelector(this.settings.spinnerSelector);
      spinner && removeElement(spinner);
    }

    if (parent != document.body) {
      addClass(parent, "progress-bar-custom-parent");
    }

    parent.appendChild(progress);
    return progress;
  }

  set(n: number): this {
    const started = this.isStarted();

    n = clamp(n, this.settings.minimum, 1);
    this.status = n === 1 ? null : n;

    const progress = this.render(!started);
    const bar = progress.querySelector(this.settings.barSelector);
    const speed = this.settings.speed;
    const ease = this.settings.easing;

    progress.offsetWidth; /* Repaint */

    queue((next) => {
      // Set positionUsing if it hasn't already been set
      if (this.settings.positionUsing === "") {
        this.settings.positionUsing = this.getPositioningCSS();
      }

      // Add transition
      css(bar as HTMLElement, this.barPositionCSS(n, speed, ease));
      if (n === 1) {
        // Fade out
        css(progress, {
          transition: "none",
          opacity: 1,
        });
        progress.offsetWidth; /* Repaint */

        setTimeout(() => {
          css(progress, {
            transition: "all " + speed + "ms linear",
            opacity: 0,
          });
          setTimeout(() => {
            this.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  }

  start(): this {
    if (!this.status) this.set(0);

    const work = () => {
      setTimeout(() => {
        if (!this.status) return;
        this.trickle();
        work();
      }, this.settings.trickleSpeed);
    };

    if (this.settings.trickle) work();

    return this;
  }

  trickle(): this {
    return this.inc(Math.random() * this.settings.trickleRate);
  }

  barPositionCSS(n: number, speed: number, ease: string) {
    let barCSS: Record<string, string>;

    if (this.settings.positionUsing === "translate3d") {
      barCSS = { transform: "translate3d(" + toBarPerc(n) + "%,0,0)" };
    } else if (this.settings.positionUsing === "translate") {
      barCSS = { transform: "translate(" + toBarPerc(n) + "%,0)" };
    } else {
      barCSS = { "margin-left": toBarPerc(n) + "%" };
    }

    barCSS.transition = "all " + speed + "ms " + ease;

    return barCSS;
  }
}
