/**
 * @class gamecore.Queue
 * @extends gamecore.LinkedList
 *
 * A high-speed queue based on offset arrays. 
 *
 * To add an item use:
 * <code>
 *   queue.push(newItem);
 * </code>
 *
 * To deque an item use:
 * <code>
 *   queue.unshift()
 *   //or
 *   queue.pop()
 * </code>
 *
 */

gamecore.Queue = gamecore.Base('gamecore.Queue',
	{},
	{
		queue: [],
		offset: 0,

		push: function(obj) {
			this.queue.push(obj);
		},
		pop: function() {
			// if the queue is empty, return undefined
          	if (this.queue.length == 0) return undefined;

          	// store the item at the front of the queue
          	var item = this.queue[this.offset];
          	//Remove memory footprint on very large sets
          	this.queue[this.offset] = null;

          	// increment the offset and remove the free space if necessary
          	if (++ this.offset * 2 >= this.queue.length){
           		this.queue  = this.queue.slice(this.offset);
            	this.offset = 0;
          	}

          	// return the dequeued item
          	return item;
		}
	}
);