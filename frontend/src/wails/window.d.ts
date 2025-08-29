declare global {
    interface Window {
        WailsInvoke(message: string): Promise<any>;
    }
}