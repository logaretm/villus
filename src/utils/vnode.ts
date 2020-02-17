import Vue from 'vue';

export function normalizeChildren(context: Vue, slotProps: any) {
  if (context.$scopedSlots.default) {
    return context.$scopedSlots.default(slotProps) || [];
  }

  return context.$slots.default || [];
}
