---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Vanilla JS'
pubDate: 2022-07-01
description: 'Shower pondering on building what have you with just the "Platform"'
author: 'Sasky'
tags: ["software", "JS", "Life thoughts"]
---

What is Vanilla JS. For me, vanilla is very simple....but also very complex. A Paradox if you will.
But for me to back up such a nonsensical statement. Let's start at the beginning.

First there was Vanilla ( or just JavaScript ), and it was good...

Actually, it wasn't good, it was shit. Netscape and IE were dancing to different drums, there were no standards, making the DOM API's of the time straight up nasty.

Then there was jQuery and it was good....

Actually it was shit, but for different reasons. First it was actually really great, it was a well thought out abstraction layer onto of the inconsistent browser API's, with neat collection, event and util functionality.

But this awesomeness meant other problem became to emerge. JQuery kinda made us dev/beginner dev's think we were good, because **we** kept building more complex shit. In hinds sight, we were shit. Pretty much all of us. The problem was our code lacked good structure. 
And Then it was that the JQuery spaghetti of shit was born. 
I remember building a few of these monstrosities, and also remember dreading having to work on them a few months after they were built. 

Now with medium to large jQuery projects, individual developer milage varied, it all depended on how much said developer could fit the mental model in their head.  These applications usually had semi structure, and semi rules, but then exceptions to those self imposed rules. They were full side effects, call back hell, and jumbled up state. The mental overhead was huge. 

Then there was [Backbone](https://backbonejs.org/)  and it was good..

Well actually... So Backbone was the answer to the problem of jQuery Spaghetti. I drank the cool aid and adopted  it for a booking system I built for a certain Bungy jumping company. At first I liked it, (once I learned it, wish I remember being quite steep ). But somehow I fucked it up. Or it fucked me up. It did give more structure than jQuery, (you were actually using Jquery with Backbone by the way). But the app become way to unwieldy.  
You know when that happens is the day a new feature or bug comes in. And you struggle to understand the code. Where you actually fear booting it up in your editor.

Then there was Vue / React  and it was good

Well, actually. You get the point. I built a ever increasing booking system in Vue 1, and at first I loved it. It was magically. two way data binding and computed properties.
The system I built, would have been never been possible for me in Jquery. 
But, you guessed it. grew to big, and after a few months my own code scared the bajesus out of me. 

And on it goes.. 

The newer frameworks allowed for ever increasing  ambitious projects. However they would inevitably  break.
Because ultimately its all built on JS, and JS (without a fuck tonne of discipline )is fragile. 
The frameworks help with that, but they also encourage you to build bigger, but that's really just a bigger pile of sticks really. 


Speaking of a pile of sticks 
- NPM -> node modules
- dependencies inside dependencies
- massive version churn over time, and fragile versioning
- Build steps
- over engineered
- shipping fuck tonne of Js to the client
- tree shaking
- when it goes wrong, it goes really wrong


See the thing is, and the thing that makes JS so wonderful, and equally so horrible is that JS is so flexible. Name your programming paradigm and JS can do it.  OO, Functional, procedural.
Declarative, imperative. 
It's flexibility has been a great thing for the web, I think. but such a flexible language, when used for serious applications. Ie ones that were built to make money. Then such flexibility must be restrained. 

This reminds me of some bullshit I was thinking about way back when I was at art school. I was contemplating the difference between what is an Art and what is a craft. 
I eventually concluded ( of read it somewhere, I can't remember ) that it all came down to the rules. With Craft the rules are set extenally. Means doing craft, like making a quilt, building a canoe or what have you. 
You can't exactly make up the rules, they are already set. The skill is excelling within those pre set boundaries. Art on the other hand must also have rules, but there are no external rules that need to be applied to a blank canvas. The rules need to come intreally from the artist. But for the art to be good. The rules need to consistant, and they need to be followed. 
