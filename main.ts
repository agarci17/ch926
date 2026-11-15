//% color="#D4AF37" icon="\uf155" block="Moneder CH-926"
namespace ch926 {
    let polsosTotals = 0
    let polsosMonedaActual = 0
    let ultimPols = 0
    let valorPerPols = 0.5
    let callbackMoneda: (importMoneda: number) => void = null
    let inicialitzat = false

    /**
     * Inicialitza el selector CH-926 al pin indicat amb pull-up intern
     * @param pin Pin on està connectat el cable blanc (COIN), eg: DigitalPin.P0
     * @param valorPols Valor en euros de cada pols (ex. 0.50), eg: 0.5
     */
    //% blockId=ch926_init
    //% block="inicia CH-926 al pin %pin amb valor per pols %valorPols €"
    //% valorPols.defl=0.5
    //% weight=100
    export function inicia(pin: DigitalPin, valorPols: number): void {
        valorPerPols = valorPols
        pins.setPull(pin, PinPullMode.PullUp)

        pins.onPulsed(pin, PulseValue.Low, function () {
            polsosTotals += 1
            polsosMonedaActual += 1
            ultimPols = input.runningTime()
        })

        if (!inicialitzat) {
            inicialitzat = true
            control.inBackground(function () {
                while (true) {
                    if (polsosMonedaActual > 0 && (input.runningTime() - ultimPols > 350)) {
                        let importRebut = polsosMonedaActual * valorPerPols
                        polsosMonedaActual = 0
                        if (callbackMoneda) {
                            callbackMoneda(importRebut)
                        }
                    }
                    basic.pause(50)
                }
            })
        }
    }

    /**
     * S'executa cada vegada que s'acaba d'introduir una moneda
     */
    //% blockId=ch926_on_coin
    //% block="en rebre moneda de $importMoneda €"
    //% draggableParameters="reporter"
    //% weight=90
    export function enRebreMoneda(handler: (importMoneda: number) => void): void {
        callbackMoneda = handler
    }

    /**
     * Retorna l'import total acumulat en euros
     */
    //% blockId=ch926_total
    //% block="import total (€)"
    //% weight=80
    export function importTotal(): number {
        return polsosTotals * valorPerPols
    }

    /**
     * Reinicia el comptador de diners a zero
     */
    //% blockId=ch926_reset
    //% block="reinicia comptador CH-926"
    //% weight=70
    export function reinicia(): void {
        polsosTotals = 0
        polsosMonedaActual = 0
    }
}