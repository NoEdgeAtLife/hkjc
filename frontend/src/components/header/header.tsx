import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './header.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <div> 
        <a href="/">Home</a>
      </div>
      <div class="logo">
        <a href="https://hkjc.com/" target="_blank">
          <img src="https://is.hkjc.com/jcbw/SplashScn/mobile/js_ewin/Speed/images/hkjclogo_c.png" />
        </a>
      </div>
      <div>
        <a href="/wp/-1">Win Place</a>
      </div>
      <div>
        <a href="/qqp/-1">Qin Qplace</a>
      </div>
      <div>
        <a href="/pro/-1">Pro</a>
      </div>
    </header>
  );
});
