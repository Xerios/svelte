import { flushSync } from 'svelte';
import { test } from '../../test';

// updated props in the middle of transitions
// and cancelled the transition halfway
export default test({
	html: `
		<div>outside Foo Foo Foo</div>
		<div>inside Foo Foo Foo</div>
	`,
	get props() {
		return { props: 'Foo' };
	},

	async test({ assert, component, target, raf }) {
		flushSync(() => {
			component.hide();
		});
		const [, div] = /** @type {NodeListOf<HTMLDivElement & { foo: number }>} */ (
			target.querySelectorAll('div')
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>outside Bar Foo Bar</div>
			<div>inside Foo Foo Foo</div>
		`
		);

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		component.props = 'Bar';
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>outside Bar Bar Bar</div>
			<div>inside Foo Foo Foo</div>
		`
		);

		flushSync(() => {
			component.show();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>outside Bar Bar Bar</div>
			<div>inside Bar Bar Bar</div>
		`
		);

		raf.tick(100);
		assert.equal(div.foo, 1);
	}
});
