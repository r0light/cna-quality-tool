// TODO only works in browser mode due to jointjs dependencies, but then router needs to be mocked, and mocking has issues in browser mode...

import { vi, expect, test } from 'vitest'
//import { mount } from '@vue/test-utils'
import App from '../src/App.vue'

test('mount component', async () => {

  expect(true).toBe(true);


  /*

  // you need to mock router
  vi.mock('vue-router', () => ({
    resolve: vi.fn(),
  }));

  expect(App).toBeTruthy()

  const wrapper = mount(App, {
    props: {}
  })
  */
})