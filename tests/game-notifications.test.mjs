import test from 'node:test';
import assert from 'node:assert/strict';
import {createNotificationInbox} from '../public/game/game-notifications.js';
const message=(id,cursor,senderId='friend',at=cursor)=>({id,cursor,senderId,at,body:'Hello'});
test('notification feed de-duplicates repeated polls and catches up multiple pages',()=>{
 const box=createNotificationInbox();box.receive({cursor:10,messages:[]});
 assert.equal(box.receive({cursor:12,messages:[message('a',11),message('b',12)]}).length,2);
 assert.equal(box.receive({cursor:12,messages:[message('a',11),message('b',12)]}).length,0);
 box.receive({cursor:13,messages:[message('c',13)]});assert.equal(box.messages.length,3);assert.equal(box.cursor,13);
});
test('self and muted messages never alert; reading one conversation keeps others unread',()=>{
 const box=createNotificationInbox();box.receive({cursor:4,messages:[message('a',1,'self'),message('b',2,'muted'),message('c',3,'friend'),message('d',4,'other')]},{self:'self',muted:id=>id==='muted'});
 assert.deepEqual(box.messages.map(m=>m.id),['c','d']);box.read('friend',3);assert.deepEqual(box.messages.map(m=>m.id),['d']);
});
test('a conversation read before its delayed feed arrives does not become unread again',()=>{
 const box=createNotificationInbox();box.read('friend',100);assert.equal(box.receive({cursor:8,messages:[message('a',7,'friend',99),message('b',8,'friend',101)]}).length,1);assert.equal(box.messages[0].id,'b');
 box.reset();assert.equal(box.cursor,null);assert.equal(box.messages.length,0);
});
