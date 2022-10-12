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
    </header>
  );
});
