//% color="#D4AF37" icon="\uf153" block="Moneder CH-926"
namespace ch926 {
    let centimsTotals = 0
    let polsosMonedaActual = 0
    let ultimPols = 0
    let callbackMoneda: (eurosMoneda: number) => void = null
    let inicialitzat = false

    // Taula de correspondència: índex = nombre de polsos (de 1 a 6), valor = cèntims
    let taulaCentims: number[] = [0, 5, 10, 20, 50, 100, 200]

    /**
     * Inicialitza el selector CH-926 al pin indicat amb pull-up intern.
     * Per defecte: 1=5cts, 2=10cts, 3=20cts, 4=50cts, 5=1€, 6=2€
     * @param pin Pin on està connectat el cable blanc (COIN), eg: DigitalPin.P0
     */
    //% blockId=ch926_init
    //% block="inicia CH-926 al pin %pin"
    //% weight=100
    export function inicia(pin: DigitalPin): void {
        pins.setPull(pin, PinPullMode.PullUp)

        pins.onPulsed(pin, PulseValue.Low, function () {
            polsosMonedaActual += 1
            ultimPols = input.runningTime()
        })

        if (!inicialitzat) {
            inicialitzat = true
            control.inBackground(function () {
                while (true) {
                    if (polsosMonedaActual > 0 && (input.runningTime() - ultimPols > 400)) {
                        let polsosRebuts = polsosMonedaActual
                        polsosMonedaActual = 0

                        let centimsRebuts = 0
                        if (polsosRebuts >= 1 && polsosRebuts < taulaCentims.length) {
                            centimsRebuts = taulaCentims[polsosRebuts]
                        }

                        if (centimsRebuts > 0) {
                            centimsTotals += centimsRebuts
                            if (callbackMoneda) {
                                callbackMoneda(centimsRebuts / 100)
                            }
                        }
                    }
                    basic.pause(30)
                }
            })
        }
    }

    /**
     * Permet personalitzar quants cèntims val cada nombre de polsos (1 a 6)
     * @param polsos Nombre de polsos configurat al CH-926 (1-6), eg: 1
     * @param centims Valor de la moneda en cèntims (ex. 50 per 0.50€), eg: 5
     */
    //% blockId=ch926_set_coin
    //% block="assigna a %polsos polsos el valor de %centims cèntims"
    //% polsos.min=1 polsos.max=6
    //% weight=95
    //% advanced=true
    export function assignaMoneda(polsos: number, centims: number): void {
        if (polsos >= 1 && polsos <= 6) {
            taulaCentims[polsos] = centims
        }
    }

    /**
     * S'executa cada vegada que entra una moneda reconeguda
     */
    //% blockId=ch926_on_coin
    //% block="en rebre moneda de $eurosMoneda €"
    //% draggableParameters="reporter"
    //% weight=90
    export function enRebreMoneda(handler: (eurosMoneda: number) => void): void {
        callbackMoneda = handler
    }

    /**
     * Retorna l'import total acumulat en euros (ex. 1.35)
     */
    //% blockId=ch926_total_euros
    //% block="import total (€)"
    //% weight=80
    export function importTotal(): number {
        return centimsTotals / 100
    }

    /**
     * Retorna l'import total acumulat en cèntims enters (ex. 135)
     */
    //% blockId=ch926_total_cents
    //% block="import total (cèntims)"
    //% weight=75
    export function importTotalCentims(): number {
        return centimsTotals
    }

    /**
     * Reinicia el comptador de diners a zero
     */
    //% blockId=ch926_reset
    //% block="reinicia comptador CH-926"
    //% weight=70
    export function reinicia(): void {
        centimsTotals = 0
        polsosMonedaActual = 0
    }
}