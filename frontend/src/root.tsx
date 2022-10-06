import { Logo } from './components/logo/logo';
import { Table } from './components/table/table';

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>HKJC Smart Money Sniper</title>
      </head>
      <body>
        <Logo />
        <Table />
      </body>
    </>
  );
};
