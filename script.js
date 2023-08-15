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


async function getData() {

    if (enterSwitch) {
        enterSwitch = !enterSwitch
        try {
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

            console.log(wordToGuess)

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
                }, i * 100);
                timeoutIds.push(id)
            }

            allLettersSelected.push(...letterComboArr)
            letterBlocks.forEach(block => {
                if (block.innerText !== '')
                    block.style.border = '2px solid purple'
            })

            typingLetters.forEach(letter => {
                if (allLettersSelected.includes(letter.innerText))
                    letter.style.border = '2px solid red'
            })

            let id = setTimeout(() => {    
                currentRowLetters = letterRows[++startingRowIndex] !== undefined ? letterRows[startingRowIndex].children : letterRows[--startingRowIndex].children
            }, 500);
            timeoutIds.push(id)

        } catch (err) {
            letterRows[startingRowIndex].style.animation = 'shakeRow 0.2s linear'
            for (let i = 0; i < currentRowLetters.length; i++) {
                currentRowLetters[i].innerText = ''
            }
            let id = setTimeout(() => {
                letterComboArr.length = 0
            }, 500);
            timeoutIds.push(id)

        } finally {
            let id = setTimeout(() => {
                letterComboArr.length = 0
                enterSwitch = !enterSwitch
            }, 500);
            timeoutIds.push(id)
        }
    }
}

let wordToGuess = getRandomWord()
