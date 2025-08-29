export interface Environment {
    buildType: string;
    platform: string;
    arch: string;
}

export class WailsAdapter {
    openInspector() {
        return window.WailsInvoke('wails:openInspector');
    }

    getEnvironment(): Promise<Environment> {
        return new Promise((resolve, reject) => {
            const id = window.crypto.randomUUID();
            window.wails.callbacks[id] = {
                resolve: resolve,
                reject: reject
            };

            window.WailsInvoke('C' + JSON.stringify({
                name: ':wails:Environment',
                callbackID: id
            }));
        });
    }
}