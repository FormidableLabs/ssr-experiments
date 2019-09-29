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
* WI time: Single worker average "inner" time inside worker (smaller is better)
* WO time: Total worker "outer" time across worker (smaller is better)
* W result: Correctness vs synchronous baseline

### Node 8

* os: darwin 18.7.0 x64
* cpus: 4
* node: v8.10.0
* execution: child process

| Demo  | Conc | Args | Impl       | M loops | WI time | WO time | W result |
| :---- | ---: | ---: | :--------- | ------: | ------: | ------: | -------- |
| react |    1 |    1 | sync       |       1 |       7 |      19 | pass     |
| react |    1 |    1 | jest       |      82 |      12 |     119 | pass     |
| react |    1 |    1 | workerpool |      80 |       5 |     112 | pass     |
| react |    1 |   5K | sync       |       1 |      60 |      60 | pass     |
| react |    1 |   5K | jest       |     118 |      64 |     151 | pass     |
| react |    1 |   5K | workerpool |     120 |      66 |     156 | pass     |
| react |    1 |  50K | sync       |       1 |    1265 |    1265 | pass     |
| react |    1 |  50K | jest       |    1169 |    1341 |    1519 | pass     |
| react |    1 |  50K | workerpool |    1167 |    1318 |    1496 | pass     |
| react |    2 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    2 |    1 | jest       |      75 |       5 |     117 | pass     |
| react |    2 |    1 | workerpool |      77 |       6 |     122 | pass     |
| react |    2 |   5K | sync       |       1 |      17 |      36 | pass     |
| react |    2 |   5K | jest       |     106 |      79 |     184 | pass     |
| react |    2 |   5K | workerpool |     121 |      83 |     183 | pass     |
| react |    2 |  50K | sync       |       1 |    1210 |    2421 | pass     |
| react |    2 |  50K | jest       |    1347 |    1672 |    1940 | pass     |
| react |    2 |  50K | workerpool |    1610 |    1845 |    2163 | pass     |
| react |    4 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    4 |    1 | jest       |     120 |      11 |     214 | pass     |
| react |    4 |    1 | workerpool |      87 |       9 |     206 | pass     |
| react |    4 |   5K | sync       |       1 |      31 |     125 | pass     |
| react |    4 |   5K | jest       |     158 |     188 |     429 | pass     |
| react |    4 |   5K | workerpool |     198 |     214 |     452 | pass     |
| react |    4 |  50K | sync       |       1 |    1612 |    6450 | pass     |
| react |    4 |  50K | jest       |    3207 |    4250 |    4979 | pass     |
| react |    4 |  50K | workerpool |    3200 |    4343 |    4905 | pass     |

### Node 10

* os: darwin 18.7.0 x64
* cpus: 4
* node: v10.16.3
* execution: child process

| Demo  | Conc | Args | Impl       | M loops | WI time | WO time | W result |
| :---- | ---: | ---: | :--------- | ------: | ------: | ------: | -------- |
| react |    1 |    1 | sync       |       1 |       9 |      25 | pass     |
| react |    1 |    1 | jest       |      90 |       6 |     140 | pass     |
| react |    1 |    1 | workerpool |      91 |       7 |     129 | pass     |
| react |    1 |   5K | sync       |       1 |      64 |      64 | pass     |
| react |    1 |   5K | jest       |     135 |      65 |     177 | pass     |
| react |    1 |   5K | workerpool |     152 |      70 |     194 | pass     |
| react |    1 |  50K | sync       |       1 |    1313 |    1313 | pass     |
| react |    1 |  50K | jest       |    1030 |    1275 |    1472 | pass     |
| react |    1 |  50K | workerpool |    1067 |    1234 |    1485 | pass     |
| react |    2 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    2 |    1 | jest       |      78 |       7 |     160 | pass     |
| react |    2 |    1 | workerpool |      73 |       8 |     134 | pass     |
| react |    2 |   5K | sync       |       1 |      21 |      43 | pass     |
| react |    2 |   5K | jest       |     145 |      90 |     215 | pass     |
| react |    2 |   5K | workerpool |     161 |     119 |     251 | pass     |
| react |    2 |  50K | sync       |       1 |    1196 |    2393 | pass     |
| react |    2 |  50K | jest       |    1412 |    1807 |    2089 | pass     |
| react |    2 |  50K | workerpool |    1575 |    2169 |    2545 | pass     |
| react |    4 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    4 |    1 | jest       |     172 |      12 |     291 | pass     |
| react |    4 |    1 | workerpool |     120 |      12 |     259 | pass     |
| react |    4 |   5K | sync       |       1 |      29 |     118 | pass     |
| react |    4 |   5K | jest       |     159 |     232 |     490 | pass     |
| react |    4 |   5K | workerpool |     187 |     206 |     511 | pass     |
| react |    4 |  50K | sync       |       1 |    1451 |    5806 | pass     |
| react |    4 |  50K | jest       |    3055 |    3853 |    4344 | pass     |
| react |    4 |  50K | workerpool |    3073 |    3985 |    4549 | pass     |

### Node 12

* os: darwin 18.7.0 x64
* cpus: 4
* node: v12.11.0
* execution: worker thread

| Demo  | Conc | Args | Impl       | M loops | WI time | WO time | W result |
| :---- | ---: | ---: | :--------- | ------: | ------: | ------: | -------- |
| react |    1 |    1 | sync       |       1 |       4 |      12 | pass     |
| react |    1 |    1 | jest       |      32 |       3 |      53 | pass     |
| react |    1 |    1 | workerpool |      43 |       4 |      58 | pass     |
| react |    1 |   5K | sync       |       1 |      68 |      68 | pass     |
| react |    1 |   5K | jest       |      35 |      68 |     126 | pass     |
| react |    1 |   5K | workerpool |      80 |      76 |     120 | pass     |
| react |    1 |  50K | sync       |       1 |    1139 |    1139 | pass     |
| react |    1 |  50K | jest       |     914 |    1307 |    1381 | pass     |
| react |    1 |  50K | workerpool |     826 |    1289 |    1370 | pass     |
| react |    2 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    2 |    1 | jest       |      22 |       4 |      64 | pass     |
| react |    2 |    1 | workerpool |      19 |       4 |      55 | pass     |
| react |    2 |   5K | sync       |       1 |      28 |      58 | pass     |
| react |    2 |   5K | jest       |      44 |     102 |     158 | pass     |
| react |    2 |   5K | workerpool |      50 |     115 |     168 | pass     |
| react |    2 |  50K | sync       |       1 |    1082 |    2164 | pass     |
| react |    2 |  50K | jest       |    1870 |    2387 |    2585 | pass     |
| react |    2 |  50K | workerpool |    2333 |    2922 |    3255 | pass     |
| react |    4 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    4 |    1 | jest       |      93 |       9 |     260 | pass     |
| react |    4 |    1 | workerpool |      13 |      26 |     218 | pass     |
| react |    4 |   5K | sync       |       1 |      29 |     123 | pass     |
| react |    4 |   5K | jest       |      95 |     231 |     537 | pass     |
| react |    4 |   5K | workerpool |     303 |     307 |     615 | pass     |
| react |    4 |  50K | sync       |       1 |    1638 |    6556 | pass     |
| react |    4 |  50K | jest       |    2710 |    3678 |    4146 | pass     |
| react |    4 |  50K | workerpool |    3174 |    4005 |    4344 | pass     |
