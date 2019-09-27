SSR Experiments
===============

Experiments for SSR-ing off the main event loop.

## Usage

```sh
$ yarn
$ yarn benchmark
```

## Overview

We provide various "implementations" (e.g. a worker pool) that can invoke "scenarios" (e.g. a React SSR) with various parameters. Here's a quick outline:

* `benchmark/scenarios`:
    * `react`: Run an SSR render with random attributes. Input is `repeat` for how many elements to create.

* `benchmark/impl`:
    * `sync`: Naive "run code in a for loop on main event loop" execution. The baseline.
    * `jest-worker`: Offload executions using child processes or worker threads using [jest-worker](https://github.com/facebook/jest/tree/master/packages/jest-worker)
    * `workerpool`: Offload executions using child processes or worker threads using [workerpool](https://github.com/josdejong/workerpool)

## Development

If you want to see the timing of individual implementation executions try this:

```sh
$ DEBUG=ssr:timer yarn benchmark
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
* cpus: 4
* node: v8.10.0

| Demo  | Conc | Args | Impl       | M loops | W time | W result |
| :---- | ---: | ---: | :--------- | ------: | -----: | -------: |
| react |    1 |    1 | sync       |       1 |     23 |     pass |
| react |    1 |    1 | jest       |      75 |    119 |     pass |
| react |    1 |    1 | workerpool |      63 |     89 |     pass |
| react |    1 |   5K | sync       |       1 |     60 |     pass |
| react |    1 |   5K | jest       |     114 |    147 |     pass |
| react |    1 |   5K | workerpool |     128 |    195 |     pass |
| react |    1 |  50K | sync       |       1 |   1402 |     pass |
| react |    1 |  50K | jest       |    1066 |   1413 |     pass |
| react |    1 |  50K | workerpool |    1103 |   1488 |     pass |
| react |    2 |    1 | sync       |       1 |      0 |     pass |
| react |    2 |    1 | jest       |      69 |     97 |     pass |
| react |    2 |    1 | workerpool |      69 |     98 |     pass |
| react |    2 |   5K | sync       |       1 |     47 |     pass |
| react |    2 |   5K | jest       |     146 |    195 |     pass |
| react |    2 |   5K | workerpool |     150 |    195 |     pass |
| react |    2 |  50K | sync       |       1 |   2529 |     pass |
| react |    2 |  50K | jest       |    1398 |   1883 |     pass |
| react |    2 |  50K | workerpool |    1451 |   1938 |     pass |
| react |    4 |    1 | sync       |       1 |      1 |     pass |
| react |    4 |    1 | jest       |      58 |    232 |     pass |
| react |    4 |    1 | workerpool |      17 |    182 |     pass |
| react |    4 |   5K | sync       |       1 |    119 |     pass |
| react |    4 |   5K | jest       |     160 |    414 |     pass |
| react |    4 |   5K | workerpool |     191 |    425 |     pass |
| react |    4 |  50K | sync       |       1 |   5447 |     pass |
| react |    4 |  50K | jest       |    2654 |   3958 |     pass |
| react |    4 |  50K | workerpool |    2903 |   4342 |     pass |

### Node 10

* os: darwin 18.7.0 x64
* cpus: 4
* node: v10.16.3

| Demo  | Conc | Args | Impl       | M loops | W time | W result |
| :---- | ---: | ---: | :--------- | ------: | -----: | -------: |
| react |    1 |    1 | sync       |       1 |     21 |     pass |
| react |    1 |    1 | jest       |      78 |    111 |     pass |
| react |    1 |    1 | workerpool |      80 |    111 |     pass |
| react |    1 |   5K | sync       |       1 |     61 |     pass |
| react |    1 |   5K | jest       |     132 |    170 |     pass |
| react |    1 |   5K | workerpool |     154 |    201 |     pass |
| react |    1 |  50K | sync       |       1 |   1191 |     pass |
| react |    1 |  50K | jest       |    1128 |   1479 |     pass |
| react |    1 |  50K | workerpool |    1110 |   1486 |     pass |
| react |    2 |    1 | sync       |       1 |      0 |     pass |
| react |    2 |    1 | jest       |      92 |    130 |     pass |
| react |    2 |    1 | workerpool |      96 |    125 |     pass |
| react |    2 |   5K | sync       |       1 |     43 |     pass |
| react |    2 |   5K | jest       |     167 |    233 |     pass |
| react |    2 |   5K | workerpool |     205 |    265 |     pass |
| react |    2 |  50K | sync       |       1 |   2477 |     pass |
| react |    2 |  50K | jest       |    1552 |   2123 |     pass |
| react |    2 |  50K | workerpool |    1504 |   2152 |     pass |
| react |    4 |    1 | sync       |       1 |      0 |     pass |
| react |    4 |    1 | jest       |       5 |    597 |     pass |
| react |    4 |    1 | workerpool |     114 |    271 |     pass |
| react |    4 |   5K | sync       |       1 |    111 |     pass |
| react |    4 |   5K | jest       |     130 |    421 |     pass |
| react |    4 |   5K | workerpool |     202 |    446 |     pass |
| react |    4 |  50K | sync       |       1 |   5932 |     pass |
| react |    4 |  50K | jest       |    3005 |   4205 |     pass |
| react |    4 |  50K | workerpool |    3070 |   4654 |     pass |

### Node 12

* os: darwin 18.7.0 x64
* cpus: 4
* node: v12.11.0

| Demo  | Conc | Args | Impl       | M loops | W time | W result |
| :---- | ---: | ---: | :--------- | ------: | -----: | -------: |
| react |    1 |    1 | sync       |       1 |     12 |     pass |
| react |    1 |    1 | jest       |      30 |     62 |     pass |
| react |    1 |    1 | workerpool |      39 |     62 |     pass |
| react |    1 |   5K | sync       |       1 |     74 |     pass |
| react |    1 |   5K | jest       |      85 |    125 |     pass |
| react |    1 |   5K | workerpool |      71 |    123 |     pass |
| react |    1 |  50K | sync       |       1 |   1107 |     pass |
| react |    1 |  50K | jest       |    1257 |   1839 |     pass |
| react |    1 |  50K | workerpool |    1204 |   1643 |     pass |
| react |    2 |    1 | sync       |       1 |      0 |     pass |
| react |    2 |    1 | jest       |      25 |     84 |     pass |
| react |    2 |    1 | workerpool |      42 |     69 |     pass |
| react |    2 |   5K | sync       |       1 |     47 |     pass |
| react |    2 |   5K | jest       |      13 |    178 |     pass |
| react |    2 |   5K | workerpool |      87 |    168 |     pass |
| react |    2 |  50K | sync       |       1 |   2157 |     pass |
| react |    2 |  50K | jest       |    1219 |   1914 |     pass |
| react |    2 |  50K | workerpool |    1525 |   2231 |     pass |
| react |    4 |    1 | sync       |       1 |      0 |     pass |
| react |    4 |    1 | jest       |      33 |    187 |     pass |
| react |    4 |    1 | workerpool |       6 |    189 |     pass |
| react |    4 |   5K | sync       |       1 |    129 |     pass |
| react |    4 |   5K | jest       |     134 |    495 |     pass |
| react |    4 |   5K | workerpool |     158 |    441 |     pass |
| react |    4 |  50K | sync       |       1 |   4944 |     pass |
| react |    4 |  50K | jest       |    2779 |   4206 |     pass |
| react |    4 |  50K | workerpool |    2774 |   4390 |     pass |
