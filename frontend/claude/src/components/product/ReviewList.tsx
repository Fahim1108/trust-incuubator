'use client';
import {useState} from 'react';
import {Button,Modal,Rating} from '@/components/ui';
import {LoginForm} from '@/components/account/AuthForms';
import type {Review} from '@/types';
/** Adapter must return approved reviews only. Never render fixture identities or inferred purchase badges. */
export function ReviewList({reviews}:{reviews:Review[];average?:number;count?:number}){
 const [login,setLogin]=useState(false);
 return <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-28"><div className="flex items-center justify-between gap-4"><h2 id="reviews-heading" className="font-serif text-3xl">Customer Reviews</h2><Button variant="outline" size="sm" onClick={()=>setLogin(true)}>Write a Review</Button></div>
 {reviews.length?<ul className="mt-5 space-y-4">{reviews.map(r=><li key={r.id} className="rounded-lg border border-line bg-white p-4"><p className="font-medium">{r.author}</p><Rating value={r.rating}/>{r.title&&<h3 className="mt-2 font-medium">{r.title}</h3>}<p className="mt-2 text-sm">{r.body}</p><time dateTime={r.createdAt} className="mt-2 block text-xs text-ink-muted">{new Date(r.createdAt).toLocaleDateString('en-BD')}</time></li>)}</ul>:<p className="mt-5 text-sm text-ink-muted">No reviews yet. Be the first to review this product.</p>}
 <Modal open={login} onClose={()=>setLogin(false)} title="Sign in to write a review" description="Your product page stays open. Review submission is currently unavailable."><LoginForm/></Modal></section>;
}
