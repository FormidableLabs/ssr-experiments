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
    * `noop`: A simple `setTimeout` to just check that all the mechanics work. Concurrent workloads are all easily parallel.
    * `react`: Run an SSR render with random attributes. Input is `repeat` for how many elements to create. Does not currently peg all CPUs, but might be an aspect of the workload given all the string concatenation...
    * `fib`: Recursively calculate the Fibonacci sequence. Fully CPU bound and will peg all CPUs at max concurrency.

* `benchmark/impl`:
    * `sync`: Naive "run code in a for loop on main event loop" execution. The baseline.
    * `jest-worker`: Offload executions using child processes or worker threads using [jest-worker](https://github.com/facebook/jest/tree/master/packages/jest-worker)
    * `workerpool`: Offload executions using child processes or worker threads using [workerpool](https://github.com/josdejong/workerpool)

## Development

If you want to see the timing of individual implementation executions try this:

```sh
$ DEBUG=ssr:timer yarn benchmark
```

We can also filter demos, implementations, and concurrencies to benchmark:

```sh
$ yarn benchmark -h
Usage: benchmark [options]

Options:
  -V, --version      output the version number
  -d, --demo <name>  Demos (default: "noop,fib,react")
  -i, --impl <name>  Implementations (default: "noop,fib,react")
  -c, --conc <name>  Concurrency values (default: "1,2,4")
  -h, --help         output usage information
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
| noop  |    1 | 10ms | sync       |       8 |      12 |      15 | pass     |
| noop  |    1 | 10ms | jest       |      81 |      15 |     122 | pass     |
| noop  |    1 | 10ms | workerpool |      80 |      15 |     113 | pass     |
| noop  |    1 |   1s | sync       |     750 |    1000 |    1001 | pass     |
| noop  |    1 |   1s | jest       |     823 |    1007 |    1116 | pass     |
| noop  |    1 |   1s | workerpool |     802 |    1008 |    1098 | pass     |
| fib   |    1 |    4 | sync       |       1 |       0 |       3 | pass     |
| fib   |    1 |    4 | jest       |      71 |       2 |      94 | pass     |
| fib   |    1 |    4 | workerpool |      63 |       2 |      81 | pass     |
| fib   |    1 |   40 | sync       |       1 |    1118 |    1118 | pass     |
| fib   |    1 |   40 | jest       |     934 |    1100 |    1179 | pass     |
| fib   |    1 |   40 | workerpool |     890 |    1060 |    1135 | pass     |
| react |    1 |    1 | sync       |       1 |       6 |      27 | pass     |
| react |    1 |    1 | jest       |      74 |       7 |      95 | pass     |
| react |    1 |    1 | workerpool |      75 |       8 |      96 | pass     |
| react |    1 |   5K | sync       |       1 |      67 |      68 | pass     |
| react |    1 |   5K | jest       |     127 |      73 |     165 | pass     |
| react |    1 |   5K | workerpool |     127 |      71 |     164 | pass     |
| react |    1 |  50K | sync       |       1 |    1216 |    1217 | pass     |
| react |    1 |  50K | jest       |    1090 |    1243 |    1427 | pass     |
| react |    1 |  50K | workerpool |    1095 |    1246 |    1420 | pass     |
| noop  |    2 | 10ms | sync       |       5 |      28 |      59 | pass     |
| noop  |    2 | 10ms | jest       |      75 |      14 |     121 | pass     |
| noop  |    2 | 10ms | workerpool |      79 |      14 |     109 | pass     |
| noop  |    2 |   1s | sync       |    1480 |     999 |    2001 | pass     |
| noop  |    2 |   1s | jest       |     814 |    1008 |    1113 | pass     |
| noop  |    2 |   1s | workerpool |     802 |    1006 |    1104 | pass     |
| fib   |    2 |    4 | sync       |       1 |       0 |       1 | pass     |
| fib   |    2 |    4 | jest       |      83 |       2 |     113 | pass     |
| fib   |    2 |    4 | workerpool |      82 |       3 |     116 | pass     |
| fib   |    2 |   40 | sync       |       1 |    1078 |    2158 | pass     |
| fib   |    2 |   40 | jest       |     975 |    1143 |    1236 | pass     |
| fib   |    2 |   40 | workerpool |     993 |    1159 |    1252 | pass     |
| react |    2 |    1 | sync       |       1 |       0 |       3 | pass     |
| react |    2 |    1 | jest       |     122 |      13 |     200 | pass     |
| react |    2 |    1 | workerpool |     126 |      12 |     171 | pass     |
| react |    2 |   5K | sync       |       1 |      31 |      63 | pass     |
| react |    2 |   5K | jest       |     171 |     136 |     280 | pass     |
| react |    2 |   5K | workerpool |     170 |     128 |     272 | pass     |
| react |    2 |  50K | sync       |       1 |    1447 |    2896 | pass     |
| react |    2 |  50K | jest       |    1455 |    1692 |    2018 | pass     |
| react |    2 |  50K | workerpool |    1651 |    1824 |    2194 | pass     |
| noop  |    4 | 10ms | sync       |      18 |      16 |      75 | pass     |
| noop  |    4 | 10ms | jest       |     133 |      18 |     214 | pass     |
| noop  |    4 | 10ms | workerpool |      84 |      17 |     212 | pass     |
| noop  |    4 |   1s | sync       |    2960 |    1000 |    4005 | pass     |
| noop  |    4 |   1s | jest       |     824 |    1006 |    1175 | pass     |
| noop  |    4 |   1s | workerpool |     890 |    1006 |    1181 | pass     |
| fib   |    4 |    4 | sync       |       1 |       0 |       4 | pass     |
| fib   |    4 |    4 | jest       |      57 |       3 |     159 | pass     |
| fib   |    4 |    4 | workerpool |      90 |       5 |     164 | pass     |
| fib   |    4 |   40 | sync       |       1 |    1070 |    4285 | pass     |
| fib   |    4 |   40 | jest       |    2342 |    2853 |    3005 | pass     |
| fib   |    4 |   40 | workerpool |    2692 |    3267 |    3454 | pass     |
| react |    4 |    1 | sync       |       1 |       0 |       1 | pass     |
| react |    4 |    1 | jest       |     163 |      15 |     329 | pass     |
| react |    4 |    1 | workerpool |      98 |      16 |     221 | pass     |
| react |    4 |   5K | sync       |       1 |      31 |     128 | pass     |
| react |    4 |   5K | jest       |     238 |     251 |     537 | pass     |
| react |    4 |   5K | workerpool |     223 |     226 |     523 | pass     |
| react |    4 |  50K | sync       |       1 |    1451 |    5810 | pass     |
| react |    4 |  50K | jest       |    2935 |    3574 |    4150 | pass     |
| react |    4 |  50K | workerpool |    2905 |    3555 |    4188 | pass     |

### Node 10

* os: darwin 18.7.0 x64
* cpus: 4
* node: v10.16.3
* execution: child process

| Demo  | Conc | Args | Impl       | M loops | WI time | WO time | W result |
| :---- | ---: | ---: | :--------- | ------: | ------: | ------: | -------- |
| noop  |    1 | 10ms | sync       |       8 |      18 |      22 | pass     |
| noop  |    1 | 10ms | jest       |      83 |      15 |     135 | pass     |
| noop  |    1 | 10ms | workerpool |      85 |      15 |     118 | pass     |
| noop  |    1 |   1s | sync       |     713 |    1000 |    1001 | pass     |
| noop  |    1 |   1s | jest       |     781 |    1006 |    1121 | pass     |
| noop  |    1 |   1s | workerpool |     788 |    1009 |    1121 | pass     |
| fib   |    1 |    4 | sync       |       1 |       0 |       4 | pass     |
| fib   |    1 |    4 | jest       |      85 |       3 |     112 | pass     |
| fib   |    1 |    4 | workerpool |      74 |       3 |      97 | pass     |
| fib   |    1 |   40 | sync       |       1 |    1152 |    1152 | pass     |
| fib   |    1 |   40 | jest       |     948 |    1129 |    1222 | pass     |
| fib   |    1 |   40 | workerpool |     953 |    1128 |    1220 | pass     |
| react |    1 |    1 | sync       |       1 |       8 |      22 | pass     |
| react |    1 |    1 | jest       |      95 |      11 |     121 | pass     |
| react |    1 |    1 | workerpool |      92 |       9 |     119 | pass     |
| react |    1 |   5K | sync       |       1 |      79 |      80 | pass     |
| react |    1 |   5K | jest       |     156 |      76 |     218 | pass     |
| react |    1 |   5K | workerpool |     146 |      80 |     194 | pass     |
| react |    1 |  50K | sync       |       1 |    1095 |    1095 | pass     |
| react |    1 |  50K | jest       |     988 |    1173 |    1394 | pass     |
| react |    1 |  50K | workerpool |    1041 |    1178 |    1417 | pass     |
| noop  |    2 | 10ms | sync       |      16 |       9 |      21 | pass     |
| noop  |    2 | 10ms | jest       |      93 |      15 |     132 | pass     |
| noop  |    2 | 10ms | workerpool |     100 |      16 |     141 | pass     |
| noop  |    2 |   1s | sync       |    1439 |    1000 |    2002 | pass     |
| noop  |    2 |   1s | jest       |     821 |    1007 |    1132 | pass     |
| noop  |    2 |   1s | workerpool |     821 |    1008 |    1149 | pass     |
| fib   |    2 |    4 | sync       |       1 |       0 |       2 | pass     |
| fib   |    2 |    4 | jest       |     101 |       3 |     135 | pass     |
| fib   |    2 |    4 | workerpool |      91 |       4 |     121 | pass     |
| fib   |    2 |   40 | sync       |       1 |    1104 |    2210 | pass     |
| fib   |    2 |   40 | jest       |    1071 |    1234 |    1348 | pass     |
| fib   |    2 |   40 | workerpool |    1110 |    1272 |    1396 | pass     |
| react |    2 |    1 | sync       |       1 |       1 |       4 | pass     |
| react |    2 |    1 | jest       |     114 |      11 |     151 | pass     |
| react |    2 |    1 | workerpool |     114 |      11 |     153 | pass     |
| react |    2 |   5K | sync       |       1 |      23 |      47 | pass     |
| react |    2 |   5K | jest       |     174 |     120 |     275 | pass     |
| react |    2 |   5K | workerpool |     170 |     124 |     286 | pass     |
| react |    2 |  50K | sync       |       1 |    1281 |    2564 | pass     |
| react |    2 |  50K | jest       |    1428 |    1719 |    2034 | pass     |
| react |    2 |  50K | workerpool |    1641 |    1889 |    2691 | pass     |
| noop  |    4 | 10ms | sync       |      32 |      10 |      43 | pass     |
| noop  |    4 | 10ms | jest       |     131 |      18 |     261 | pass     |
| noop  |    4 | 10ms | workerpool |      98 |      18 |     235 | pass     |
| noop  |    4 |   1s | sync       |    2877 |    1000 |    4005 | pass     |
| noop  |    4 |   1s | jest       |     821 |    1012 |    1223 | pass     |
| noop  |    4 |   1s | workerpool |     840 |    1008 |    1192 | pass     |
| fib   |    4 |    4 | sync       |       1 |       0 |       1 | pass     |
| fib   |    4 |    4 | jest       |      89 |       5 |     183 | pass     |
| fib   |    4 |    4 | workerpool |      95 |       4 |     188 | pass     |
| fib   |    4 |   40 | sync       |       1 |    1107 |    4435 | pass     |
| fib   |    4 |   40 | jest       |    2493 |    3007 |    3200 | pass     |
| fib   |    4 |   40 | workerpool |    2841 |    3471 |    3733 | pass     |
| react |    4 |    1 | sync       |       1 |       0 |       2 | pass     |
| react |    4 |    1 | jest       |     154 |      18 |     257 | pass     |
| react |    4 |    1 | workerpool |     137 |      21 |     247 | pass     |
| react |    4 |   5K | sync       |       1 |      29 |     121 | pass     |
| react |    4 |   5K | jest       |     205 |     216 |     523 | pass     |
| react |    4 |   5K | workerpool |     241 |     245 |     481 | pass     |
| react |    4 |  50K | sync       |       1 |    1367 |    5474 | pass     |
| react |    4 |  50K | jest       |    2492 |    3414 |    3971 | pass     |
| react |    4 |  50K | workerpool |    2905 |    3768 |    4405 | pass     |

### Node 12

* os: darwin 18.7.0 x64
* cpus: 4
* node: v12.11.0
* execution: worker thread

| Demo  | Conc | Args | Impl       | M loops | WI time | WO time | W result |
| :---- | ---: | ---: | :--------- | ------: | ------: | ------: | -------- |
| noop  |    1 | 10ms | sync       |       8 |      14 |      16 | pass     |
| noop  |    1 | 10ms | jest       |      40 |      14 |      63 | pass     |
| noop  |    1 | 10ms | workerpool |      34 |      15 |      51 | pass     |
| noop  |    1 |   1s | sync       |     669 |     999 |    1001 | pass     |
| noop  |    1 |   1s | jest       |     708 |    1004 |    1050 | pass     |
| noop  |    1 |   1s | workerpool |     739 |    1007 |    1053 | pass     |
| fib   |    1 |    4 | sync       |       1 |       0 |       4 | pass     |
| fib   |    1 |    4 | jest       |      32 |       2 |      45 | pass     |
| fib   |    1 |    4 | workerpool |      27 |       2 |      36 | pass     |
| fib   |    1 |   40 | sync       |       1 |    1279 |    1280 | pass     |
| fib   |    1 |   40 | jest       |     875 |    1182 |    1218 | pass     |
| fib   |    1 |   40 | workerpool |     836 |    1248 |    1281 | pass     |
| react |    1 |    1 | sync       |       1 |       3 |      16 | pass     |
| react |    1 |    1 | jest       |      31 |       5 |      47 | pass     |
| react |    1 |    1 | workerpool |      56 |      16 |     123 | pass     |
| react |    1 |   5K | sync       |       1 |     121 |     122 | pass     |
| react |    1 |   5K | jest       |      18 |      98 |     156 | pass     |
| react |    1 |   5K | workerpool |      65 |     124 |     172 | pass     |
| react |    1 |  50K | sync       |       1 |    1414 |    1414 | pass     |
| react |    1 |  50K | jest       |     938 |    1394 |    1500 | pass     |
| react |    1 |  50K | workerpool |    1153 |    1508 |    1608 | pass     |
| noop  |    2 | 10ms | sync       |      16 |       9 |      20 | pass     |
| noop  |    2 | 10ms | jest       |      42 |      15 |     119 | pass     |
| noop  |    2 | 10ms | workerpool |      24 |      17 |      89 | pass     |
| noop  |    2 |   1s | sync       |    1415 |    1000 |    2002 | pass     |
| noop  |    2 |   1s | jest       |     728 |    1006 |    1088 | pass     |
| noop  |    2 |   1s | workerpool |     747 |    1004 |    1080 | pass     |
| fib   |    2 |    4 | sync       |       1 |       0 |       2 | pass     |
| fib   |    2 |    4 | jest       |      18 |       1 |      74 | pass     |
| fib   |    2 |    4 | workerpool |      25 |       4 |      70 | pass     |
| fib   |    2 |   40 | sync       |       1 |    1152 |    2306 | pass     |
| fib   |    2 |   40 | jest       |     941 |    1223 |    1302 | pass     |
| fib   |    2 |   40 | workerpool |     866 |    1304 |    1393 | pass     |
| react |    2 |    1 | sync       |       1 |       0 |       0 | pass     |
| react |    2 |    1 | jest       |      44 |       7 |      83 | pass     |
| react |    2 |    1 | workerpool |      23 |       6 |      83 | pass     |
| react |    2 |   5K | sync       |       1 |      25 |      53 | pass     |
| react |    2 |   5K | jest       |      54 |      99 |     252 | pass     |
| react |    2 |   5K | workerpool |      79 |     134 |     283 | pass     |
| react |    2 |  50K | sync       |       1 |    1132 |    2266 | pass     |
| react |    2 |  50K | jest       |    1250 |    1798 |    1938 | pass     |
| react |    2 |  50K | workerpool |    1784 |    2430 |    2622 | pass     |
| noop  |    4 | 10ms | sync       |      21 |      12 |      55 | pass     |
| noop  |    4 | 10ms | jest       |      41 |      24 |     202 | pass     |
| noop  |    4 | 10ms | workerpool |      55 |      27 |     196 | pass     |
| noop  |    4 |   1s | sync       |    2917 |    1000 |    4003 | pass     |
| noop  |    4 |   1s | jest       |     746 |    1005 |    1168 | pass     |
| noop  |    4 |   1s | workerpool |     759 |    1006 |    1110 | pass     |
| fib   |    4 |    4 | sync       |       1 |       0 |       9 | pass     |
| fib   |    4 |    4 | jest       |      30 |       1 |     124 | pass     |
| fib   |    4 |    4 | workerpool |       7 |       1 |     116 | pass     |
| fib   |    4 |   40 | sync       |       1 |    1238 |    4956 | pass     |
| fib   |    4 |   40 | jest       |    2400 |    2975 |    3101 | pass     |
| fib   |    4 |   40 | workerpool |    2241 |    3091 |    3245 | pass     |
| react |    4 |    1 | sync       |       1 |       0 |       1 | pass     |
| react |    4 |    1 | jest       |      50 |      21 |     148 | pass     |
| react |    4 |    1 | workerpool |      51 |      24 |     161 | pass     |
| react |    4 |   5K | sync       |       1 |      20 |      83 | pass     |
| react |    4 |   5K | jest       |      80 |     254 |     408 | pass     |
| react |    4 |   5K | workerpool |     154 |     255 |     408 | pass     |
| react |    4 |  50K | sync       |       1 |    1337 |    5351 | pass     |
| react |    4 |  50K | jest       |    3068 |    3788 |    4230 | pass     |
| react |    4 |  50K | workerpool |    3582 |    4418 |    4941 | pass     |
