Actor Language Design
=====================

This document describes considerations for the design of a language for actor-oriented programming.

## What is actor-oriented programming?

The [Actor Model](https://en.wikipedia.org/wiki/Actor_model) describes computation by passing asynchronous messages between opaque computational elements (actors).
In response to a message that it receives, an actor can make local decisions, create more actors, send more messages, and designate how to respond to the next message received.
Since actor implementations are opaque, the "state" of an actor may only be inferred from its response to messages.

## Where are actors most useful?

## Why a new language?

## Primary language goals

## Key Questions

### How is an actor's state/behavior represented?
### What are the semantics of actor message-passing?
