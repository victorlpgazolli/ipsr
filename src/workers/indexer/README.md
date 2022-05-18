Worker responsible for receiving incoming packages CID uploads and indexing database for showing this new package to user with metadata

## Workflow

```
┌───────────┐    ┌───────────┐  ┌───────────────┐   ┌───────────────────────────────────────────────────────┐
│           │    │           │  │               │   │                                                       │
│  workers  ├────┤  indexer  ├──┤ consume key   ├──►│  set package key with cid and metadata in redis       │
│           │    │           │  │               │   │                                                       │
└───────────┘    └───────────┘  └───────────────┘   └───────────────────────────────────────────────────────┘
```