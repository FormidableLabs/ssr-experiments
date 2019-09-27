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
* execution: child process

| Demo  | Conc | Args | Impl       | M loops | W time | W result |
| :---- | ---: | ---: | :--------- | ------: | -----: | -------: |
| react |    1 |    1 | sync       |       1 |     21 |     pass |
| react |    1 |    1 | jest       |      91 |    142 |     pass |
| react |    1 |    1 | workerpool |      86 |    124 |     pass |
| react |    1 |   5K | sync       |       1 |     67 |     pass |
| react |    1 |   5K | jest       |     185 |    266 |     pass |
| react |    1 |   5K | workerpool |     137 |    181 |     pass |
| react |    1 |  50K | sync       |       1 |   1357 |     pass |
| react |    1 |  50K | jest       |    1348 |   1777 |     pass |
| react |    1 |  50K | workerpool |    1217 |   1651 |     pass |
| react |    2 |    1 | sync       |       1 |      0 |     pass |
| react |    2 |    1 | jest       |      75 |    103 |     pass |
| react |    2 |    1 | workerpool |      73 |     98 |     pass |
| react |    2 |   5K | sync       |       1 |     46 |     pass |
| react |    2 |   5K | jest       |     140 |    193 |     pass |
| react |    2 |   5K | workerpool |     148 |    189 |     pass |
| react |    2 |  50K | sync       |       1 |   2538 |     pass |
| react |    2 |  50K | jest       |    1342 |   1844 |     pass |
| react |    2 |  50K | workerpool |    1670 |   2426 |     pass |
| react |    4 |    1 | sync       |       1 |      0 |     pass |
| react |    4 |    1 | jest       |      64 |    177 |     pass |
| react |    4 |    1 | workerpool |      22 |    179 |     pass |
| react |    4 |   5K | sync       |       1 |    112 |     pass |
| react |    4 |   5K | jest       |     105 |    348 |     pass |
| react |    4 |   5K | workerpool |     183 |    373 |     pass |
| react |    4 |  50K | sync       |       1 |   5304 |     pass |
| react |    4 |  50K | jest       |    2534 |   3531 |     pass |
| react |    4 |  50K | workerpool |    2797 |   4022 |     pass |

### Node 10

* os: darwin 18.7.0 x64
* cpus: 4
* node: v10.16.3
* execution: child process

| Demo  | Conc | Args | Impl       | M loops | W time | W result |
| :---- | ---: | ---: | :--------- | ------: | -----: | -------: |
| react |    1 |    1 | sync       |       1 |     22 |     pass |
| react |    1 |    1 | jest       |      81 |    123 |     pass |
| react |    1 |    1 | workerpool |      77 |    104 |     pass |
| react |    1 |   5K | sync       |       1 |     59 |     pass |
| react |    1 |   5K | jest       |     152 |    196 |     pass |
| react |    1 |   5K | workerpool |     131 |    169 |     pass |
| react |    1 |  50K | sync       |       1 |   1523 |     pass |
| react |    1 |  50K | jest       |    1056 |   1567 |     pass |
| react |    1 |  50K | workerpool |    1430 |   1914 |     pass |
| react |    2 |    1 | sync       |       1 |      0 |     pass |
| react |    2 |    1 | jest       |      94 |    145 |     pass |
| react |    2 |    1 | workerpool |      87 |    113 |     pass |
| react |    2 |   5K | sync       |       1 |     39 |     pass |
| react |    2 |   5K | jest       |     152 |    282 |     pass |
| react |    2 |   5K | workerpool |     328 |    467 |     pass |
| react |    2 |  50K | sync       |       1 |   2769 |     pass |
| react |    2 |  50K | jest       |    2285 |   3320 |     pass |
| react |    2 |  50K | workerpool |    2416 |   4040 |     pass |
| react |    4 |    1 | sync       |       1 |      0 |     pass |
| react |    4 |    1 | jest       |     191 |    291 |     pass |
| react |    4 |    1 | workerpool |     104 |    258 |     pass |
| react |    4 |   5K | sync       |       1 |    152 |     pass |
| react |    4 |   5K | jest       |     254 |    578 |     pass |
| react |    4 |   5K | workerpool |     350 |    604 |     pass |
| react |    4 |  50K | sync       |       1 |   7433 |     pass |
| react |    4 |  50K | jest       |    3980 |   5797 |     pass |
| react |    4 |  50K | workerpool |    4050 |   6251 |     pass |

### Node 12

* os: darwin 18.7.0 x64
* cpus: 4
* node: v12.11.0
* execution: worker thread

| Demo  | Conc | Args | Impl       | M loops | W time | W result |
| :---- | ---: | ---: | :--------- | ------: | -----: | -------: |
| react |    1 |    1 | sync       |       1 |     11 |     pass |
| react |    1 |    1 | jest       |      30 |     47 |     pass |
| react |    1 |    1 | workerpool |      29 |     40 |     pass |
| react |    1 |   5K | sync       |       1 |     75 |     pass |
| react |    1 |   5K | jest       |      70 |    108 |     pass |
| react |    1 |   5K | workerpool |      54 |    100 |     pass |
| react |    1 |  50K | sync       |       1 |   1005 |     pass |
| react |    1 |  50K | jest       |     805 |   1152 |     pass |
| react |    1 |  50K | workerpool |     870 |   1177 |     pass |
| react |    2 |    1 | sync       |       1 |      0 |     pass |
| react |    2 |    1 | jest       |      18 |     43 |     pass |
| react |    2 |    1 | workerpool |      13 |     63 |     pass |
| react |    2 |   5K | sync       |       1 |     44 |     pass |
| react |    2 |   5K | jest       |      13 |    134 |     pass |
| react |    2 |   5K | workerpool |      41 |    139 |     pass |
| react |    2 |  50K | sync       |       1 |   1905 |     pass |
| react |    2 |  50K | jest       |    1697 |   2344 |     pass |
| react |    2 |  50K | workerpool |    1891 |   2595 |     pass |
| react |    4 |    1 | sync       |       1 |      0 |     pass |
| react |    4 |    1 | jest       |      49 |    133 |     pass |
| react |    4 |    1 | workerpool |      36 |    103 |     pass |
| react |    4 |   5K | sync       |       1 |     96 |     pass |
| react |    4 |   5K | jest       |      77 |    380 |     pass |
| react |    4 |   5K | workerpool |     192 |    410 |     pass |
| react |    4 |  50K | sync       |       1 |   6743 |     pass |
| react |    4 |  50K | jest       |    4657 |   6640 |     pass |
| react |    4 |  50K | workerpool |    4473 |   6099 |     pass |
