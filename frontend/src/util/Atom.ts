class Atom {
    public readonly name:string
    public variables:string[]

    constructor(name:string, variables:string[]) {
        this.name = name
        this.variables = variables
    }

    public copy(): Atom {
        return new Atom(this.name, [...this.variables])
    }

    public toString() {
        return `${this.name}(${this.variables.join(',')})`
    }

}

export default Atom