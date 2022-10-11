import { component$, Slot } from '@builder.io/qwik';
import Header from '../components/header/header';

export default component$(() => {
  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
        </section>
      </main>
      <footer>
        <a href="https://bet.hkjc.com/" target="_blank">
          Bet with HKJC <img src="https://bet.hkjc.com/info/include/images/en/btn_ewin_off.gif" />
        </a>
      </footer>
    </>
  );
});
