<!--eslint-disable vue/no-mutating-props-->
<template>
  <div class="tags-container">
    <div class="tags" :style="style">
      <template v-for="(option, index) in options" :key="index">
        <div v-if="getOptions(option)" class="tag-group">
          <div
            class="group-label"
            :style="{
              backgroundColor: option?.child?.length > 0 ? '#f6f6f9' : '#fff',
            }"
          >
            <a-tag
              v-if="groupItemSelectable"
              :color="value.includes(getValue(option)) ? activeColor : color"
              :closable="closable && !option?.disabled"
              :style="internalTagStyle"
              @click="handleClick(option)"
            >
              <a-tooltip v-if="getTag(option)?.length > 26">
                <template #title>{{ getTag(option) }}</template>
                {{ `${getTag(option).slice(0, 26)}...` }}&nbsp;&nbsp;
              </a-tooltip>
              <template v-else>{{ getTag(option) }}</template>
              <template #closeIcon>
                <icon-font
                  style="font-size: 12px"
                  type="icon-shanchu1"
                  @click.stop="handleRemove(option)"
                />
              </template>
            </a-tag>
            <div
              v-else
              :id="`${getValue(option) + index}`"
              style="margin: 4px 8px"
            >
              <a-tooltip v-if="getTag(option)?.length > 26">
                <template #title>{{ getTag(option) }}</template>
                {{ `${getTag(option).slice(0, 26)}...` }}&nbsp;&nbsp;
              </a-tooltip>
              <template v-else>{{ getTag(option) }}</template>
            </div>
            <div v-if="option?.child?.length > 0">
              <a-divider style="margin: 4px 8px" />
              <template v-for="(child, index) in option?.child" :key="index">
                <a-tag
                  v-if="groupItemSelectable"
                  :color="value.includes(getValue(child)) ? activeColor : color"
                  :closable="closable && !option?.disabled"
                  :style="internalTagStyle"
                  @click="handleClick(child)"
                >
                  <a-tooltip v-if="getTag(child)?.length > 26">
                    <template #title>{{ getTag(child) }}</template>
                    {{ `${getTag(child).slice(0, 26)}...` }}&nbsp;&nbsp;
                  </a-tooltip>
                  <template v-else>{{ getTag(child) }}</template>
                  <template #closeIcon>
                    <icon-font
                      style="font-size: 12px"
                      type="icon-shanchu1"
                      @click.stop="handleRemove(child)"
                    />
                  </template>
                </a-tag>
                <div
                  v-else
                  :id="`${getValue(option) + index}`"
                  style="margin: 4px 8px"
                >
                  <a-tooltip v-if="getTag(option)?.length > 26">
                    <template #title>{{ getTag(option) }}</template>
                    {{ `${getTag(option).slice(0, 26)}...` }}&nbsp;&nbsp;
                  </a-tooltip>
                  <template v-else>{{ getTag(option) }}</template>
                </div>
              </template>
            </div>
          </div>
          <div
            :style="
              groupItemSelectable
                ? {}
                : {
                    borderTop: '1px solid #D9D9D9',
                    borderBottom: '1px solid #D9D9D9',
                    padding: '4px 0',
                  }
            "
          >
            <tags-view
              v-model:value="value"
              :field-names="fieldNames"
              :color="color"
              :active-color="activeColor"
              :closable="closable && !option?.disabled"
              :tag-style="internalTagStyle"
              :options="getOptions(option)"
              :group-item-anchorable="false"
              :group-item-selectable="true"
              @select="emits('select', $event)"
            />
          </div>
        </div>
        <template v-else>
          <a-tag
            :color="value.includes(getValue(option)) ? activeColor : color"
            :closable="closable && !option?.disabled"
            :style="internalTagStyle"
            @click="handleClick(option)"
          >
            <a-tooltip v-if="getTag(option)?.length > 26">
              <template #title>{{ getTag(option) }}</template>
              {{ `${getTag(option).slice(0, 26)}...` }}&nbsp;&nbsp;
            </a-tooltip>
            <template v-else>{{ getTag(option) }}</template>
            <template #closeIcon>
              <IconFont
                style="font-size: 12px"
                type="icon-shanchu1"
                @click.stop="handleRemove(option)"
              />
            </template>
          </a-tag>
          <!--          <div v-if="option?.child?.length > 0">-->
          <!--            <a-divider style="margin: 4px 8px" />-->
          <!--            <template v-for="(child, index) in option?.child" :key="index">-->
          <!--              <a-tag-->
          <!--                :color="value.includes(getValue(child)) ? activeColor : color"-->
          <!--                :closable="closable && !option?.disabled"-->
          <!--                :style="internalTagStyle"-->
          <!--                @click="handleClick(child)"-->
          <!--              >-->
          <!--                <a-tooltip v-if="getTag(child)?.length > 26">-->
          <!--                  <template #title>{{ getTag(child) }}</template>-->
          <!--                  {{ `${getTag(child).slice(0, 26)}...` }}&nbsp;&nbsp;-->
          <!--                </a-tooltip>-->
          <!--                <template v-else>{{ getTag(child) }}</template>-->
          <!--                <template #closeIcon>-->
          <!--                  <icon-font-->
          <!--                    style="font-size: 12px"-->
          <!--                    type="icon-shanchu1"-->
          <!--                    @click.stop="handleRemove(child)"-->
          <!--                  />-->
          <!--                </template>-->
          <!--              </a-tag>-->
          <!--            </template>-->
          <!--          </div>-->
        </template>
      </template>
    </div>
    <div v-if="groupItemAnchorable" class="anchors">
      <span
        v-for="anchor in anchors"
        :key="anchor.value"
        @click="scrollIntoBiew(anchor.value)"
      >
        {{ anchor.label }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Option } from "./FilterableSelect.vue";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    value?: string[];
    options?: Option[];
    closable?: boolean;
    tagStyle?: string;
    color?: string;
    activeColor?: string;
    fieldNames?: { value?: string; label?: string; options?: string };
    scroll?: { x?: number; y?: number };
    groupItemSelectable?: boolean;
    groupItemAnchorable?: boolean;
    getShowValue?: ((val: any) => string) | undefined;
  }>(),
  {
    value: () => [],
    options: () => [],
    closable: true,
    color: "default",
    activeColor: "blue",
    tagStyle: "",
    groupItemSelectable: true,
    groupItemAnchorable: false,
    getShowValue: undefined,
  }
);

console.log(props.value);

const emits = defineEmits(["update:value", "select", "remove"]);

const internalTagStyle = computed(() => `margin: 4px 8px;${props.tagStyle}`);

const style = computed(() => {
  if (!props.scroll) return {};
  const result: any = {};
  if (props.scroll.y) {
    result["maxHeight"] = props.scroll.y + "px";
    result["overflow-y"] = "scroll";
  }

  if (props.scroll.x) {
    result["maxWidth"] = props.scroll.x + "px";
    result["overflow-x"] = "scroll";
  }
  return result;
});

const getValue = (item: Option) => item?.[props.fieldNames?.value || "value"];
const getLabel = (item: Option) => item?.[props.fieldNames?.label || "label"];
const getOptions = (item: Option) =>
  item?.[props.fieldNames?.options || "options"];
const getTag = (item: Option) => {
  const val =
    props.getShowValue && typeof props.getShowValue === "function"
      ? props.getShowValue(item)
      : "";
  // console.log(val || getLabel(item));
  return val || getLabel(item);
};
const anchors = computed(() => {
  return props.options.map((option, index) => ({
    value: getValue(option) + index,
    label: getLabel(option),
  }));
});

const handleClick = (option: Option) => {
  // console.log(option, getValue(option));
  emits("select", getValue(option));
};

const handleRemove = (option: Option) => {
  emits("remove", getValue(option));
};

const scrollIntoBiew = (domId: string) => {
  document.querySelector(`#${domId}`)?.scrollIntoView(false);
};
</script>

<style lang="less" scoped>
.tags-container {
  position: relative;
  //& .group-label {
  //  background-color: #f6f6f9;
  //}
  .anchors {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    span {
      color: #096dd9;
      cursor: pointer;
    }
  }
}
.tag-group:not(:first-child) {
  margin-top: 16px;
}
:deep(.ant-tag-close-icon) {
  display: inline-block;
  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
