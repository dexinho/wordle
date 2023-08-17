const letterRows = document.querySelectorAll('.letter-rows')
const letterBlocks = document.querySelectorAll('.letter-blocks')
let startingRowIndex = 0
let currentRowLetters = letterRows[startingRowIndex].children
const typingLetters = document.querySelectorAll('.typing-letters')
const letterComboArr = []
const timeoutIds = []
let enterSwitch = true
const allLettersSelected = []

function getRandomWord() {
    const wordsToGuessArr = JSON.parse(localStorage.getItem('wordsToGuess')) || []
    return wordsToGuessArr[Math.floor(Math.random() * wordsToGuessArr.length)].toUpperCase()
}

typingLetters.forEach(letter => {
    letter.addEventListener('click', () => {
        if (letter.classList.contains('typing-letters')) {
            for (let i = 0; i < currentRowLetters.length; i++) {
                if (currentRowLetters[i].innerText === '') {
                    currentRowLetters[i].innerText = letter.innerText
                    letterComboArr.push(letter.innerText)
                    break;
                }
            }
        }
    })
})

const enterKeyContainer = document.querySelector('#enter-container')
const deleteKeyContainer = document.querySelector('#delete-container')

enterKeyContainer.addEventListener('click', () => {
    if (letterComboArr.length === 5) {
        getData()
    }
})
deleteKeyContainer.addEventListener('click', () => {
    for (let i = currentRowLetters.length - 1; i >= 0; i--) {
        if (currentRowLetters[i].innerText >= 'A' && currentRowLetters[i].innerText <= 'Z') {
            letterComboArr.pop()
            currentRowLetters[i].innerText = ''
            break;
        }
    }
})

function colorBorders() {

    return new Promise((resolve) => {
        for (let i = 0; i < wordToGuess.length; i++) {
            let id = setTimeout(() => {
                currentRowLetters[i].style.animation = 'letterBlock 0.1s linear'
                if (wordToGuess[i] === currentRowLetters[i].innerText) {
                    currentRowLetters[i].style.backgroundColor = 'green'
                }
                else if (wordToGuess.split('').includes(currentRowLetters[i].innerText.toUpperCase())) {
                    currentRowLetters[i].style.backgroundColor = 'yellow'
                }
                else currentRowLetters[i].style.backgroundColor = 'gray'

                if (i === wordToGuess.length - 1) resolve()
            }, i * 100);
            timeoutIds.push(id)
        }
    })
}


async function getData() {

    if (enterSwitch) {
        enterSwitch = !enterSwitch
        try {
            letterRows[startingRowIndex].style.animation = ''
            const wordForLink = letterComboArr.join('')
            const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordForLink}`)
            const jsonData = await data.json()


            for (const id of timeoutIds) clearTimeout(id)
            timeoutIds.length = 0

            const dataWord = jsonData[0].word
            console.log('dataWord', dataWord)
            const wordsToGuessArr = JSON.parse(localStorage.getItem('wordsToGuess')) || []

            
            if (!wordsToGuessArr.includes(dataWord)) {
                wordsToGuessArr.push(dataWord)
                localStorage.setItem('wordsToGuess', JSON.stringify(wordsToGuessArr))
            }
            
            await colorBorders()

        if (letterComboArr.join('') === wordToGuess) {
            const dialogForEnding = document.querySelector('#dialog-for-ending')
            dialogForEnding.showModal()
        }
            console.log(wordToGuess)

            allLettersSelected.push(...letterComboArr)
            letterBlocks.forEach(block => {
                if (block.innerText !== '')
                    block.style.border = '2px solid purple'
            })

            typingLetters.forEach(letter => {
                if (allLettersSelected.includes(letter.innerText))
                    letter.style.border = '2px solid red'
            })

            currentRowLetters = letterRows[++startingRowIndex] !== undefined ? letterRows[startingRowIndex].children : letterRows[--startingRowIndex].children

        } catch (err) {
            console.log(letterRows[startingRowIndex])
            letterRows[startingRowIndex].style.animation = 'shakeRow 0.2s linear'
            for (let i = 0; i < currentRowLetters.length; i++) {
                currentRowLetters[i].innerText = ''
            }
            letterComboArr.length = 0
            letterRows[startingRowIndex].style.animation = ''
        } finally {
            enterSwitch = !enterSwitch
            letterComboArr.length = 0
        }
    }
}

let wordToGuess = 'HELLO'

