import { globalStore } from '../../mobx/GlobalStore';

type StatusType = 'error' | 'success';

const updateStatusBar = (message: string, type: StatusType = 'success', duration: number = Infinity) => {
  if (globalStore.statusTimeoutId !== null) {
    clearTimeout(globalStore.statusTimeoutId);
  }

  globalStore.setStatusMessage(message);
  globalStore.setStatusType(type);

  if (duration !== Infinity) {
    const timeoutId: number = setTimeout(() => {
      globalStore.setStatusMessage('');
    }, duration) as unknown as number;
    globalStore.setStatusTimeoutId(timeoutId);
  }
};

export default updateStatusBar;