# cozyasm
a javascript assembly-like interpreter simulator. Be warned, the current versions have **no/minimal** error catching and safety nets. status: **NOT PRODUCTION READY**

### planned
- [x] construct IRTree generator
- [x] normal command calls
- [ ] create builtins
- [ ] label jumping
- [ ] main entry point
- [ ] subroutine calls
- [ ] subroutine parameters as registers
- [ ] cozyasm cli
- [ ] make documentation
### list of supported compiled languages
to compile to a language, use the cozyasm cli with the `--compile=NAME` flag. (not implemented). This list is subject to change, especially if the assembly languages chosen are not able to be compiled (they are missing key features). Also note all commands are not portable to all languages, especially `nlin`, `llin`, and `puts`. (although puts could be implemented in a form of std library for the language).

- [ ] [lux](https://github.com/obscuredc/lux)
- [ ] also see the [planned list](https://github.com/stars/obscuredc/lists/assembly-emulators).
### cozyasm cli
list of implemented flags:

- [ ] `--dump`: provides a output log of the classes and functions used to interpret and compile code.
- [ ] `--compile=NAME`: instructs the compiler to compile to a specific assembly language.

### known errors
- [ ] import infinite loops

### instruction set
this set can, and will, change many times! 

- [x] mov
- [x] add
- [x] sub
- [x] mul
- [x] div
- [x] ifeq
- [x] iflt
- [x] iflq
- [x] nlin
- [x] llin
- [x] mload
- [x] import
- [x] tbufpsh
- [x] tbufwr
- [x] tbufcls
- [x] puts
- [ ] endl
- [x] end
- [x] load
- [x] store
- [x] rad
- [x] ralloc
- [x] malloc