interface Wails {
  Callback(incomingMessage: string): void;

  callbacks: {
    [name: string]: {timeoutHandle?: ReturnType<setTimeout>; resolve: Function; reject: Function};
  };

  EventsNotify(notifyMessage: string): void;

  eventListeners: {[name: string]: new (eventName: string, callback: Function, maxCallbacks: number) => any};
}

interface Window {
  WailsInvoke(message: string): Promise<any>;

  wails: Wails;
}
