import {app, BrowserWindow, shell, desktopCapturer, session, ipcMain} from "electron";
import {join} from "path";
import {productName, description, version} from "../package.json";

import installExtension, {VUEJS_DEVTOOLS} from "electron-devtools-installer";

/**
 * ** The built directory structure
 * ------------------------------------
 * ├─┬ build/electron
 * │ └── main.js        > Electron-Main
 * │ └── preload.js     > Preload-Scripts
 * ├─┬ build/app
 *   └── index.html     > Electron-Renderer
 */

process.env.BUILD_APP = join(__dirname, "../app");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
	? join(__dirname, "../../public")
	: process.env.BUILD_APP;

let mainWindow: BrowserWindow | null = null;

function createWindow(args: string[] = []) {
	mainWindow = new BrowserWindow({
		icon: join(__dirname, "../../src/assets/icons/icon.png"),
		title: `${productName} | ${description} - v${version}`,
		width: 1200,
		height: 900,
		minWidth: 1200,
		minHeight: 900,
		resizable: true,
		maximizable: true,
		fullscreen: args.findIndex((arg) => arg.startsWith("--deviceId")) !== -1,
		webPreferences: {
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			nodeIntegration: true,
			contextIsolation: false,
			preload: join(__dirname, "preload.js"),
			additionalArguments: args,
		},
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
		mainWindow.webContents.openDevTools();
		mainWindow.maximize();
	} else {
		mainWindow.loadFile(join(process.env.BUILD_APP, "index.html"));
	}

	// Make all links open with the browser, not with the application
	mainWindow.webContents.setWindowOpenHandler(({url}) => {
		if (url.startsWith("https:")) shell.openExternal(url);
		return {action: "deny"};
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
	if (process.env.VITE_DEV_SERVER_URL) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			console.error("Vue Devtools failed to install:", e.toString());
		}
	}

	createWindow();

	// header security policy
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": ["script-src 'self'"],
			},
		});
	});

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		const allWindows = BrowserWindow.getAllWindows();
		allWindows.length === 0 ? createWindow() : allWindows[0].focus();
	});

	// Handle IPC message from the renderer process
	ipcMain.handle("getScreens", () => {
		// get desktop capturer windows
		return desktopCapturer.getSources({types: ["screen"]}).then((sources) => {
			return sources.map((source) => {
				return {
					id: source.id,
					name: source.name,
					thumbnail: source.thumbnail.toDataURL(),
				};
			});
		});
	});

	ipcMain.handle("getWindows", () => {
		// get desktop capturer windows
		return desktopCapturer.getSources({types: ["window"]}).then((sources) => {
			return sources.map((source) => {
				return {
					id: source.id,
					name: source.name,
					thumbnail: source.thumbnail.toDataURL(),
				};
			});
		});
	});

	ipcMain.handle("openWindow", (_, args) => {
		createWindow(args);
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	mainWindow = null;
	if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
