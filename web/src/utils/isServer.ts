// window is only defined when the page is loaded on the browser
// so the function will return "false" when rendering on the server
export const isServer = () => typeof window === "undefined";
