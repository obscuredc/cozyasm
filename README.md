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
### instruction set
this set can, and will, change many times! 

- [ ] mov
- [ ] add
- [ ] sub
- [ ] mul
- [ ] div
- [ ] ifeq
- [ ] iflq
- [ ] nlin
- [ ] llin
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
- [ ] ralloc
- [ ] malloc