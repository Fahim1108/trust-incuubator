'use client';
import {useEffect} from 'react';
export function useUnsavedDraft(dirty:boolean){
 useEffect(()=>{
  if(!dirty)return;
  const leave=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
  const navigate=(event:MouseEvent)=>{const target=event.target instanceof Element?event.target.closest('a[href]'):null;if(!target)return;const href=target.getAttribute('href');if(!href||href.startsWith('#'))return;if(!window.confirm('You have unsaved product changes. Leave without saving?')){event.preventDefault();event.stopImmediatePropagation();}};
  window.addEventListener('beforeunload',leave);document.addEventListener('click',navigate,true);
  return ()=>{window.removeEventListener('beforeunload',leave);document.removeEventListener('click',navigate,true);};
 },[dirty]);
}
