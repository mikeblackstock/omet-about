import osjs from 'osjs';
import {name as applicationName} from './metadata.json';

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const handler= (msg) => {
     console.warn('Message from Iframe', msg);
  };
  const proc = core.make('osjs/application', {args, options, metadata});

  // Create  a new Window instance
 proc.createWindow({
 	attributes: {
    	closeable:true
  	},
 
    title: metadata.title.en_EN,
    dimension: {width: 700, height:500},
    position: 'center'
  })
  .on('destroy', () => proc.destroy())
  .render(($content, win) => {
  	if (window.mobile === true)
		win.maximize();
 
    // Add our process and window id to iframe URL
    const suffix = `?pid=${proc.pid}&wid=${win.wid}`;

    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = proc.resource('/data/index.html') + suffix;
    iframe.setAttribute('border', '0');

    // Bind window events to iframe
    win.on('blur', () => iframe.contentWindow.blur());
    win.on('focus', () => iframe.contentWindow.focus());
    win.on('iframe:post', msg => iframe.contentWindow.postMessage(msg, window.location.href));
	
    // Listen for messages from iframe
    win.on('iframe:get', msg => {
	  handler(msg);
      win.emit('iframe:post', 'Pong');
    });
	proc.on('attention', () => {
		iframe.contentWindow.home();
		win.focus();	
	});
	
    $content.appendChild(iframe);
  });
  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
