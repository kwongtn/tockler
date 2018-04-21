import * as menubar from 'menubar';

import MenuBuilder from './menu-builder';

import { app, ipcMain, BrowserWindow } from 'electron';
import config from './config';
import * as path from 'path';
import * as os from 'os';
import { sequelize } from './models/index';

import { logManager } from './log-manager';
let logger = logManager.getLogger('WindowManager');

export default class WindowManager {
    static mainWindow;
    static menubar;

    static initMenus() {
        const menuBuilder = new MenuBuilder(this.mainWindow);
        menuBuilder.buildMenu();
    }

    static setMainWindow() {
        logger.info('Creating main window.');
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 1000,
            show: true,
            title: 'Tockler',
            icon: config.iconBig,
        });

        this.mainWindow.maximize();
        const url = config.isDev
            ? 'http://localhost:3000'
            : 'file://' + config.client + '/index.html';
        this.mainWindow.loadURL(url);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
            console.log('Main window closed');
        });

        this.mainWindow.on('focus', () => {
            let sendEventName = 'main-window-focus';
            console.log('Sending focus event: ' + sendEventName);
            // this.mainWindow.webContents.send(sendEventName, 'ping');
        });

        this.mainWindow.webContents.on('did-finish-load', () => {
            console.log('did-finish-load');
            this.mainWindow.show();
            this.mainWindow.focus();
        });

        this.mainWindow.on('close', () => {
            if (this.mainWindow) {
                console.log('Closing window');
                this.mainWindow = null;
            }
        });
    }

    static initMainWindowEvents() {
        logger.info('Init main window events.');
        ipcMain.on('toggle-main-window', (ev, name) => {
            if (!this.mainWindow) {
                console.log('MainWindow closed, opening');
                WindowManager.setMainWindow();
            }

            console.log('Toggling main window');
            if (this.mainWindow.isVisible()) {
                console.log('Show main window');
                this.mainWindow.show();
            } else if (this.mainWindow.isMinimized()) {
                console.log('Restore main window');
                this.mainWindow.restore();
            } else {
                console.log('Hide main window');
                this.mainWindow.hide();
            }
        });
    }

    static setTrayWindow() {
        logger.info('Creating tray window.');
        /**
         * Docs:
         * https://github.com/maxogden/menubar
         */
        let icon = os.platform() === 'darwin' ? config.icon : config.iconBig;
        const url = config.isDev
            ? 'http://localhost:3000/#/trayApp'
            : 'file://' + config.client + '/index.html/#/trayApp';

        this.menubar = menubar({
            index: url,
            icon: icon,
            preloadWindow: true,
            showDockIcon: true,
            width: 400,
            height: 500,
        });

        // this.menubar.on('after-create-window', () => {});
        this.menubar.on('after-show', () => {
            console.log('Show tray');
            this.menubar.window.webContents.send('focus-tray', 'ping');

            if (config.isDev) {
                console.log('Open menubar dev tools');
                this.menubar.window.openDevTools();
            }
        });
    }
}

export const windowManager = new WindowManager();
