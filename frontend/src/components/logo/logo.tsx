import { component$, useStyles$ } from '@builder.io/qwik';

export const Logo = component$(() => {
  useStyles$(`
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  `);

  return (
    <logo class="logo">
      <a href="/">
        <img
          alt="HKJC Logo"
          width={400}
          height={147}
          src="https://www.hkjc.com/home/common/chinese/images/logo_hkjc.png"
        />
      </a>
    </logo>
  );
});
