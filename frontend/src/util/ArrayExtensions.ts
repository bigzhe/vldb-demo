declare global {
  interface Array<T> {
    // remove(val: T): any;
    unique(): any;
    intersection(that: T[]): T[];
    difference(that: T[]): T[];
    union(that: T[]): T[];
    isSuperset(that: T[]): boolean;
    subsets(): T[][];
    equals(that: T[]): boolean;
    permutation(): T[][];
  }
}
// Array.prototype.remove = function (val: any): any {
//   const index = this.indexOf(val);
//   if (index > -1) {
//     this.splice(index, 1);
//   }
// }

Array.prototype.unique = function (): any {
  return Array.from(new Set(this))
}

Array.prototype.intersection = function (that: any[]): any[] {
  return this.filter(a => (that.includes(a))).unique()
}

Array.prototype.difference = function (that: any[]): any[] {
  return this.filter(a => !(that.includes(a))).unique()
}

Array.prototype.union = function (that: any[]): any[] {
  return [...this, ...that].unique()
}

Array.prototype.isSuperset = function (that: any[]): boolean {
  return that.every(a => (this.includes(a)))
}

Array.prototype.subsets = function (): any[][] {
  return this.reduce(
    (subsets, value) => subsets.concat(
      subsets.map((set: any[]) => [value, ...set])
    ),
    [[]]
  );
}

Array.prototype.equals = function (that: any[]): boolean {
  return this.length == that.length && this.difference(that).length == 0
}

Array.prototype.permutation = function (): any[][] {
  let result: any[] = [];
  const permute = (arr: any[], m: any[] = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
      }
    }
  }
  permute(this)
  return result
}


export { }
