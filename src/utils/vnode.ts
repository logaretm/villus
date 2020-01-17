import { SetupContext } from 'vue';

export function normalizeChildren(context: SetupContext, slotProps: any) {
  if (!context.slots.default) {
    return [];
  }

  return context.slots.default(slotProps) || [];
}
