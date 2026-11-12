import { test } from 'node:test';
import assert from 'node:assert/strict';
import { personNameError, phoneError } from '../src/modules/identity/domain/person-validation';
test('live personal field validation accepts formatted phones and accents and reports digits/overflow immediately',()=>{
 assert.equal(personNameError("João D'Ávila"),'');assert.equal(personNameError('Ana-Maria'),'');
 assert.match(personNameError('Ana 2'),/números/);assert.match(personNameError('Ana ٢'),/números/);
 assert.match(personNameError('A'.repeat(101)),/100/);
 assert.equal(phoneError('(18) 99749-9717'),'');assert.equal(phoneError('+55 (18) 99749-9717'),'');
 assert.match(phoneError('189974997171234'),/limite/);assert.match(phoneError('(18) ABCDE-FGHI'),/números/);
  assert.match(phoneError('189974997171'),/limite/);
});
