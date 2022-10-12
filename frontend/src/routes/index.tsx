import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="col2">
      <Link class="mindblow" href="/wp/1">
        Win Place
      </Link>
      <Link class="mindblow" href="/qqp/1">
        Q/ Qplace
      </Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
};
