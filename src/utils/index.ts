import { v4 as uuid } from "uuid";
export * from "./antd";

export const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, time);
  });
};

export const getUUID = () => {
  return uuid();
};

export const cuu = uuid;

export function isFunction(
  item: unknown
): item is (...args: unknown[]) => unknown {
  return typeof item === "function";
}

export function isPrototype<T extends Record<string, unknown>>(
  value: unknown
): value is T {
  return typeof value === "object";
}

export function deepEqual(object1: any, object2: any) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let index = 0; index < keys1.length; index++) {
    const val1 = object1[keys1[index]];
    const val2 = object2[keys2[index]];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

function isObject(object: any) {
  return object != null && typeof object === "object";
}

export function formateObjToParamStr(paramObj: any) {
  const sdata = [];
  for (const attr in paramObj) {
    sdata.push(`${attr}=${encodeURIComponent(paramObj[attr])}`);
  }
  return sdata.join("&");
}
