.main:                  ; quick note: this code will not work until I push
    .subr p0 include:   ; the subroutine update. the code will run, but 
        import p0       ; you will be unable to call functions defined here.
        endl            ; also, main label execution will affect this.
    .subr p0 HelloWorld:
        puts "Hello, world!"
        endl