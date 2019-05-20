# PALO IT internal coding challenge edition 01


For fun and education

## Table of contents <a name="table-of-contents"></a>
1. [Table of contents](#table-of-contents)
2. [Overview](#overview)
3. [Requirements](#requirements)
4. [How to use](#how-to-use)
5. [How to participate](#how-to-participate)
6. [Function description](#function-description)
7. [Scoring](#scoring)




## Overview <a name="overview"></a>
The first edition of Palo IT internal coding challenge. The task is to write a small piece of code.
Your solution has to be `readable`, `preferment` and `pass provided tests`.



## Requirements <a name="requirements"></a>

You need to have Node.js in reasonable version installed. (8<)

Use
```
npm install
```
to install all the dependencies.

## How to use <a name="how-to-use"></a>

Implement `functionUnderTest` in `src/functionUnderTest/index.js` file according to specs and tests.

Use
```
npm start
```
to check your solution against tests. You can also run tests in watch mode with
```
npm i -g jest
jest --watch
```
or use VSC plugin.


## How to participate <a name="how-to-participate"></a>

1. Create a branch with your name eg `feature/your_name_here`.
2. Implement and commit your solution there. It should take you no more than 2h. Feel free to experiment with different solutions.
3. When your solution is ready create a pull request to the master branch.
4. Once all participants will finish everyone will take part in scoring.



##Function description <a name="function-description"></a>

The function will take the collection name (`tableName`) campaign object `campaign` and should return `upsertCampaign()` result. 

The campaign object model description:

```
/**
 * A Slot
 * @typedef {Object} Slot
 * @property {string=} id - The identifier
 * @property {boolean=} error determines there is an error in the slot
 *
 * @example { id: '22', error: false }
 */

/**
 * A campaign
 * @typedef {Object} Campaign
 * @property {string=} id - The identifier
 * @property {Date=} createdAt - The date
 * @property {Slot[]} bookingSlots - The list of booking slot objects
 *
 * @example {id: 'qwe', createdAt: new Date(), bookingSlots: [ ... ] }
 */
 ```

- When campaign is new (ie. does not have an `id`) function needs to create it using ```generateId()```, and add the `createdAt` with current date.
- when a slot is in error state the function needs to update it using `upsertBooking(slot, true)`
- when a slot needs to be removed (the id changed to '0') the function needs to update it using `upsertBooking(slot, false)` then it has to be removed from the `campaign` and updated campaign has to be saved using `upsertCampaign(tableName, campaign)` 
- it there was an error performing upsert function has to return error object
```
{
  success: false,
  statusCode: 400
}
```

## Scoring <a name="scoring"></a>
There will be two benchmarks determining the quality of your solution:

1. **Performance** There are test that measure execution time of you method on big data sets. Lowest sum of the execution times wins. Winner gets `1 point`, second place gets `2 points` etc.
2. **Code readability** Every participant will judge others' code readability. After the implementation all will go through all the branches and order them from most to least readable (NO VOTING IN YOUR OWN CODE). Again winner gets `1 point`, second place gets `2 points` etc. 

Finally **Performance** and **Code readability**  scores will be added and the lowest score wins!!

Example

```
3 participants  A, B, C

participant A's solution turned out to be the quickest one, but hes colleges both said his solution was least readable.
Performance: 1pt
Readability: 2pt + 2pt
Score: 5pt

```
