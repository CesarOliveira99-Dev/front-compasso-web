import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageMemoryKey, recalledPage, rememberPage } from '../src/modules/workspace/presentation/page-memory';

function installStorage(storage: Storage) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage });
  return () => { if (original) Object.defineProperty(globalThis, 'sessionStorage', original); else Reflect.deleteProperty(globalThis, 'sessionStorage'); };
}

test('page memory restores refresh destination and isolates accounts, spaces and roles', t => {
  const memory = new Map<string, string>();
  t.after(installStorage({ length: 0, clear: () => memory.clear(), key: () => null, removeItem: (key: string) => { memory.delete(key); }, getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } }));
  const user = { id: 'owner', tenantId: 'space-a', role: 'admin' };
  const key = pageMemoryKey(user, 'workspace');
  rememberPage(key, 'wallet');
  assert.equal(recalledPage(key, ['home', 'wallet'], 'home'), 'wallet');
  for (const other of [{ ...user, id: 'other' }, { ...user, tenantId: 'space-b' }, { ...user, role: 'customer' }]) {
    assert.equal(recalledPage(pageMemoryKey(other, 'workspace'), ['home', 'wallet'], 'home'), 'home');
  }
  assert.equal(recalledPage(key, ['home'], 'home'), 'home');
});

test('browser storage failure does not prevent navigation', t => {
  t.after(installStorage({ length: 0, clear: () => {}, key: () => null, removeItem: () => {}, getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }));
  assert.doesNotThrow(() => rememberPage('key', 'wallet'));
  assert.equal(recalledPage('key', ['wallet'], 'home'), 'home');
});
