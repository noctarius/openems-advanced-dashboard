type Callback = (...args: any[]) => any;

interface Wails {
  Callback(incomingMessage: string): void;

  callbacks: {
    [name: string]: { timeoutHandle?: ReturnType<setTimeout>; resolve: Callback; reject: Callback };
  };

  EventsNotify(notifyMessage: string): void;

  eventListeners: { [name: string]: new (eventName: string, callback: Callback, maxCallbacks: number) => any };
}

interface Window {
  WailsInvoke(message: string): Promise<any>;

  wails: Wails;
}
