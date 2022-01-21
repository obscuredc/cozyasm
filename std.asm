.main:                  ; this is the std library for cozyasm.
    .subr p0 include:   ; this is just a rename for import,
        import p0       ; in case you prefer, like C.
        endl            
    .subr p1 mod:       ; this function does p0 % p1 and outputs the remainder.
        ralloc 0        ;0
        dep 0           ;1 allocates the next register to &x0.
        iflt p0, p1     ;2
        nlin 5          ;3 we know that its done
        sub p0, p1, &p0 ;4
        puts p0         ;5
        iflt p0, p1     ;6
        nlin 2          ;7
        llin 4          ;8
        mov &x0, p0     ;9
        depf &x0        ;10
        endl            ;11
    .subr p0 testi:
        ralloc 0
        nlin 2
        mov &r0, 1
        mov &r0, 2
        endl
    .subr p0 testii:
        ralloc 0
        mov &r0, 0
        iflt 3,2
        mov &r0, 1
        endl
    .subr p0 testiii:
        callasImport
        callasImport
        puts "ok"
        nlin 3
        end
        end
        end
        llin 4
        endl