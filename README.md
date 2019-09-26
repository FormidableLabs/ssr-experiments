SSR Experiments
===============

Experiments for SSR-ing off the main event loop.

## Usage

```sh
$ yarn
$ yarn benchmark
```

## Example results

### Key

* Demo: Scenario
* Conc: Level of concurrency _and_ number of executions
* Args: Options passed to worker (e.g. "number of times to repeat")
* M loops: Main thread loops on 1ms timer (bigger is better)
* W time: Worker elapsed time (smaller is better)
* W result: Correctness vs synchronous baseline

### Node 8

* os: darwin 18.7.0 x64
* node: v8.10.0

| Demo  | Conc | Args | Impl | M loops | W time | W result |
| :---- | ---: | ---: | :--- | ------: | -----: | -------: |
| react |    1 |    1 | sync |       1 |     21 |     pass |
| react |    1 |    1 | jest |      80 |    131 |     pass |
| react |    1 |   5K | sync |       1 |     87 |     pass |
| react |    1 |   5K | jest |     125 |    166 |     pass |
| react |    1 |  50K | sync |       1 |   1572 |     pass |
| react |    1 |  50K | jest |    1233 |   1650 |     pass |
| react |    2 |    1 | sync |       1 |      0 |     pass |
| react |    2 |    1 | jest |      65 |     92 |     pass |
| react |    2 |   5K | sync |       1 |     39 |     pass |
| react |    2 |   5K | jest |     120 |    158 |     pass |
| react |    2 |  50K | sync |       1 |   2126 |     pass |
| react |    2 |  50K | jest |    1252 |   1682 |     pass |
| react |    4 |    1 | sync |       1 |      0 |     pass |
| react |    4 |    1 | jest |      47 |    161 |     pass |
| react |    4 |   5K | sync |       1 |     98 |     pass |
| react |    4 |   5K | jest |      71 |    304 |     pass |
| react |    4 |  50K | sync |       1 |   5054 |     pass |
| react |    4 |  50K | jest |    2283 |   3536 |     pass |

### Node 10

* os: darwin 18.7.0 x64
* node: v10.16.3

| Demo  | Conc | Args | Impl | M loops | W time | W result |
| :---- | ---: | ---: | :--- | ------: | -----: | -------: |
| react |    1 |    1 | sync |       1 |     24 |     pass |
| react |    1 |    1 | jest |      81 |    118 |     pass |
| react |    1 |   5K | sync |       1 |     71 |     pass |
| react |    1 |   5K | jest |     160 |    229 |     pass |
| react |    1 |  50K | sync |       1 |   1425 |     pass |
| react |    1 |  50K | jest |    1028 |   1415 |     pass |
| react |    2 |    1 | sync |       1 |      0 |     pass |
| react |    2 |    1 | jest |      86 |    128 |     pass |
| react |    2 |   5K | sync |       1 |     37 |     pass |
| react |    2 |   5K | jest |     128 |    210 |     pass |
| react |    2 |  50K | sync |       1 |   2343 |     pass |
| react |    2 |  50K | jest |    1439 |   2072 |     pass |
| react |    4 |    1 | sync |       1 |      0 |     pass |
| react |    4 |    1 | jest |     186 |    376 |     pass |
| react |    4 |   5K | sync |       1 |    130 |     pass |
| react |    4 |   5K | jest |     193 |    465 |     pass |
| react |    4 |  50K | sync |       1 |   6002 |     pass |
| react |    4 |  50K | jest |    3096 |   5125 |     pass |

### Node 12

* os: darwin 18.7.0 x64
* node: v12.11.0


| Demo  | Conc | Args | Impl | M loops | W time | W result |
| :---- | ---: | ---: | :--- | ------: | -----: | -------: |
| react |    1 |    1 | sync |       1 |     13 |     pass |
| react |    1 |    1 | jest |      34 |     57 |     pass |
| react |    1 |   5K | sync |       1 |     58 |     pass |
| react |    1 |   5K | jest |      71 |    122 |     pass |
| react |    1 |  50K | sync |       1 |   1085 |     pass |
| react |    1 |  50K | jest |     855 |   1248 |     pass |
| react |    2 |    1 | sync |       1 |      3 |     pass |
| react |    2 |    1 | jest |      38 |     89 |     pass |
| react |    2 |   5K | sync |       1 |     55 |     pass |
| react |    2 |   5K | jest |      46 |    161 |     pass |
| react |    2 |  50K | sync |       1 |   2020 |     pass |
| react |    2 |  50K | jest |    1396 |   2104 |     pass |
| react |    4 |    1 | sync |       1 |      0 |     pass |
| react |    4 |    1 | jest |      75 |    240 |     pass |
| react |    4 |   5K | sync |       1 |    104 |     pass |
| react |    4 |   5K | jest |      77 |    360 |     pass |
| react |    4 |  50K | sync |       1 |   4992 |     pass |
| react |    4 |  50K | jest |    2971 |   4773 |     pass |
