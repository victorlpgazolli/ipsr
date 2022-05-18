# IPSR

### A peer-to-peer Software Repository for Smartphones

## Quick summary

IPSR (Interplanetary Software Repository) is a **distributed software repository** that seeks to make available all mobile software to any mobile devices. In some ways, this is similar to the original aims of apps stores, but IPSR is actually more similar to a single BitTorrent swarm exchanging Git objects. You can read more about its origins in the paper [IPFS - Content Addressed, Versioned, P2P File System](https://github.com/ipfs/ipfs/blob/master/papers/ipfs-cap2pfs/ipfs-p2p-file-system.pdf?raw=true).


### Workflow
```
                ┌────────────┐        ┌──────────────────────────┐
                │            │ action │                          │
            ┌───┤  publish   ├────────┤  validate package info   │
            │   │            │        │                          │
            │   └────────────┘        └───────────┬──────────────┘          ┌────────────────────────────────────────────────┐
            │                                     │                         │                                                │
            │                                     │                         │    POST /api/v1/package/[author]/[package]     │
            │                                     │                         │                                                │
            │                         ┌───────────▼───────────┐      ┌─────►│    params:                                     │
            │                         │                       │      │      │      metadata                                  │
            │                    ┌────┤ POST /api/v1/publish  ├──────┘      │      cid                                       │
            │                    │    │                       │             │                                                │
┌────────┐  │   ┌────────────┐   │    └───────────────────────┘             └────────────────────────────────────────────────┘
│        │  │   │            │   │
│  cli   ├──┼───┤   daemon   ├───┤
│        │  │   │            │   │    ┌───────────────────────┐             ┌────────────────────────────────────────────────┐    ┌──────────────────┐
└────────┘  │   └────────────┘   │    │                       │             │                                                │    │                  │
            │                    └────┤ GET /api/v1/download  ├────────────►│    GET /api/v1/package/[author]/[package]      ├───►│  ipfs get <cid>  │
            │                         │                       │             │                                                │    │                  │
            │                         └─────────▲─────────────┘             └────────────────────────────────────────────────┘    └──────────────────┘
            │                                   │
            │                                   │
            │   ┌────────────┐                  │
            │   │            │                  │
            └───┤  download  ├──────────────────┘
                │            │
                └────────────┘





                                  ┌─────────┐     ┌──────────────────────┐     ┌────────────────────────────────────────┐
                                  │         │     │                      │     │                                        │
┌────────────┐           ┌────────┤   api   ├─────┤ POST /api/v1/package ├────►│   send cid and metadata to worker      │
│            │           │        │         │     │                      │     │                                        │
│  website   ├───────────┤        └─────────┘     └──────────────────────┘     └────────────────────────────────────────┘
│            │           │
└────────────┘           │
                         │
                         │
                         │                          ┌───────────────────────────┐
                         │                          │                           │
                         │                       ┌──┤ GET /p/[author]/[package] ├───┐
                         │                       │  │                           │   │   ┌────────────────────────────────────────┐
                         │      ┌────────────┐   │  └───────────────────────────┘   │   │                                        │
                         │      │            │   │                                  ├──►│ get package(s) from redis key and show │
                         └──────┤   view     ├───┤  ┌──────────────────┐            │   │                                        │
                                │            │   │  │                  │            │   └────────────────────────────────────────┘
                                └────────────┘   └──┤ GET /p/[author]  ├────────────┘
                                                    │                  │
                                                    └──────────────────┘



┌───────────┐    ┌───────────┐  ┌───────────────┐   ┌───────────────────────────────────────────────────────┐
│           │    │           │  │               │   │                                                       │
│  workers  ├────┤  indexer  ├──┤ consume key   ├──►│  set package key with cid and metadata in redis       │
│           │    │           │  │               │   │                                                       │
└───────────┘    └───────────┘  └───────────────┘   └───────────────────────────────────────────────────────┘
```