/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

function domReady(condition: DocumentReadyState[] = ["complete", "interactive"]) {
	return new Promise((resolve) => {
		if (condition.includes(document.readyState)) {
			resolve(true);
		} else {
			document.addEventListener("readystatechange", () => {
				if (condition.includes(document.readyState)) {
					resolve(true);
				}
			});
		}
	});
}

const safeDOM = {
	append(parent: HTMLElement, child: HTMLElement) {
		if (!Array.from(parent.children).find((e) => e === child)) {
			return parent.appendChild(child);
		}
	},
	remove(parent: HTMLElement, child: HTMLElement) {
		if (Array.from(parent.children).find((e) => e === child)) {
			return parent.removeChild(child);
		}
	},
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
	const className = `loaders-css__ball-clip-rotate`;
	const styleContent = `
    @keyframes rotate {
        0% {
          -webkit-transform: rotate(0deg);
                  transform: rotate(0deg); }
        50% {
          -webkit-transform: rotate(180deg);
                  transform: rotate(180deg); }
        100% {
          -webkit-transform: rotate(360deg);
                  transform: rotate(360deg); } }

  .${className} > div {
        width: 64px;
        height: 64px;
        border-radius: 100%;
        -webkit-animation-fill-mode: both;
                animation-fill-mode: both;
        border: 12px solid #5046e5;
        border-bottom-color: transparent;
        background: transparent !important;
        display: inline-block;
        animation: rotate 0.65s 0s linear infinite;
    }

  .app-loading-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    z-index: 9;
  }
      `;
	const oStyle = document.createElement("style");
	const oDiv = document.createElement("div");

	oStyle.id = "app-loading-style";
	oStyle.innerHTML = styleContent;
	oDiv.className = "app-loading-wrap";
	oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

	return {
		appendLoading() {
			safeDOM.append(document.head, oStyle);
			safeDOM.append(document.body, oDiv);
		},
		removeLoading() {
			safeDOM.remove(document.head, oStyle);
			safeDOM.remove(document.body, oDiv);
		},
	};
}

// ----------------------------------------------------------------------

const {appendLoading, removeLoading} = useLoading();
domReady().then(appendLoading);

/**  ---------- Remove Loading ----------- */
// Control variables to remove Loading
let appLoaded = false;
let timeout = false;

// setTimeout(() => {
// 	timeout = true;
// 	appLoaded && removeLoading();
// }, 4999);

/**
 * Define an event to listen for the "removeLoading" message and
 * run the removeLoading function if the application is already loaded and
 * the timeout has been reached
 *
 * Note: Fire this event during app assembly (src/main.ts file)
 *
 * @param event
 *
 * Example:
 * //main.ts
 *  ....
 *  createApp(App)
 *      .mount('#app')
 *      .$nextTick(() => postMessage({ payload: 'removeLoading' }, '*') );
 *
 */
window.onload = () => removeLoading();
