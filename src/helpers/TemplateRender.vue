<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TemplateRenderer",
  props: {
    params: {
      type: Object,
    },
    render: {
      type: Function,
    },
  },
  setup(props) {
    return () => {
      if (!props.render) return null;
      return props.render(props.params);
    };
  },
});
</script>
