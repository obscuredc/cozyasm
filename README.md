# cozyasm

### planned
- [x] construct IRTree generator
- [x] normal command calls
- [ ] create builtins
- [ ] label jumping
- [ ] main entry point
- [ ] subroutine calls
- [ ] subroutine parameters as registers
- [ ] option to compile to [lux](https://github.com/obscuredc/lux)
- [ ] cozyasm cli
### list of supported compiled languages
to compile to a language, use the cozyasm cli with the `--compile=NAME` flag. (not implemented). This list is subject to change, especially if the assmebly languages chosen are not able to be compiled (they are missing key features). Also note all commands are not portable to all languages, especially `nlin`, `llin`, and `puts`. (although puts could be implemented in a form of std library for the language).

- [ ] [lux](https://github.com/obscuredc/lux)
### cozyasm cli
list of implemented flags:

- [ ] `--dump`: provides a output log of the classes and functions used to interpret and compile code.
- [ ] `--compile=NAME`: instructs the compiler to compile to a specific assembly language.

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
- [ ] mload
- [ ] import
- [ ] tbufpsh
- [ ] tbufwr
- [ ] tbufcls
- [ ] puts (modeI)
- [ ] puts (modeII)
- [ ] endl
- [ ] end
- [ ] load
- [ ] store
- [ ] rad
- [x] ralloc
- [x] malloc