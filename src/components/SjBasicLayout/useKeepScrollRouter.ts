import { nextTick, reactive, Ref } from "vue";
import { useRouter } from "vue-router";

export default function useKeepScrollRouter(
  containerRef: Ref<HTMLElement | null>
) {
  const router = useRouter();
  const scrollPosition = reactive<
    Record<
      string,
      {
        top: number;
        left: number;
      }
    >
  >({});
  router?.afterEach((to, from) => {
    if (containerRef.value) {
      scrollPosition[String(from.name)] = {
        top: containerRef.value.scrollTop,
        left: containerRef.value.scrollLeft,
      };
    }
    const pos = scrollPosition[String(to.name)];
    nextTick(() => {
      if (pos && containerRef.value) {
        containerRef.value.scrollTop = pos.top;
        containerRef.value.scrollLeft = pos.left;
      }
    });
  });
  return router;
}
