const letterRows = document.querySelectorAll('.letter-rows')
const letterBlocks = document.querySelectorAll('.letter-blocks')
let STARTING_ROW_INDEX = 0
let currentRowLetters = letterRows[STARTING_ROW_INDEX].children
const typingLetters = document.querySelectorAll('.typing-letters')
const LETTER_COMBO_ARR = []
const TIMEOUT_IDS = []
let FETCH_SWITCH = true
const ALL_LETTERS_SELECTED = []

function getRandomWord() {
    const fiveLetterWordsArr = JSON.parse(localStorage.getItem('fiveLetterWords')) || []
    return fiveLetterWordsArr[Math.floor(Math.random() * fiveLetterWordsArr.length)].toUpperCase()
}

// fetch('./list.txt').then(data => data.json()).then(words => {
//     localStorage.setItem('fiveLetterWords', JSON.stringify(words))
// })

typingLetters.forEach(letter => {
    letter.addEventListener('click', () => {
        if (letter.classList.contains('typing-letters')) {
            for (let i = 0; i < currentRowLetters.length; i++) {
                if (currentRowLetters[i].innerText === '') {
                    currentRowLetters[i].innerText = letter.innerText
                    LETTER_COMBO_ARR.push(letter.innerText)
                    break;
                }
            }
        }
    })
})

const enterKeyContainer = document.querySelector('#enter-container')
const deleteKeyContainer = document.querySelector('#delete-container')

enterKeyContainer.addEventListener('click', () => {
    if (LETTER_COMBO_ARR.length === 5) {
        getData()
    }
})
deleteKeyContainer.addEventListener('click', () => {
    for (let i = currentRowLetters.length - 1; i >= 0; i--) {
        if (currentRowLetters[i].innerText >= 'A' && currentRowLetters[i].innerText <= 'Z') {
            LETTER_COMBO_ARR.pop()
            currentRowLetters[i].innerText = ''
            break;
        }
    }
})

function colorInsideOfLetterBlocks() {

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
            TIMEOUT_IDS.push(id)
        }
    })
}

const pauseForHowManyMilliseconds = delay => {
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, delay);
    })
}

async function getData() {

    if (FETCH_SWITCH) {
        FETCH_SWITCH = !FETCH_SWITCH
        try {
            letterRows[STARTING_ROW_INDEX].style.animation = ''
            const wordForLink = LETTER_COMBO_ARR.join('')
            const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordForLink}`)
            const jsonData = await data.json()
            // console.log('word fetched', jsonData[0].word)
            clearTimeoutIds()
            wordleBeingPlayed(jsonData[0].word)
        } catch (err) {
            // console.log('CATCH BLOCK', letterRows[STARTING_ROW_INDEX])
            letterRows[STARTING_ROW_INDEX].style.animation = 'shakeRow 0.2s linear'
            for (let i = 0; i < currentRowLetters.length; i++) {
                currentRowLetters[i].innerText = ''
            }
        } finally {
            FETCH_SWITCH = !FETCH_SWITCH
            LETTER_COMBO_ARR.length = 0
        }
    }
}

async function wordleBeingPlayed(word) {
    // console.log(letterRows[STARTING_ROW_INDEX])

    addWordToLocalStorage(word)
    await colorInsideOfLetterBlocks()
    checkIfTheWordIsGuessed()

    colorBordersOfTypingAndLetterBlocks()
    currentRowLetters = letterRows[++STARTING_ROW_INDEX] !== undefined
        ? letterRows[STARTING_ROW_INDEX].children
        : letterRows[--STARTING_ROW_INDEX].children

}

function clearTimeoutIds() {
    for (const id of TIMEOUT_IDS) clearTimeout(id)
    TIMEOUT_IDS.length = 0
}

function checkIfTheWordIsGuessed() {
    if (LETTER_COMBO_ARR.join('') === wordToGuess) {
        const dialogForEnding = document.querySelector('#dialog-for-success')
        dialogForEnding.showModal()
    }
}

function addWordToLocalStorage(word) {
    const fiveLetterWordsArr = JSON.parse(localStorage.getItem('fiveLetterWords')) || []

    if (!fiveLetterWordsArr.includes(word)) {
        fiveLetterWordsArr.push(word)
        localStorage.setItem('fiveLetterWords', JSON.stringify(fiveLetterWordsArr))
    }
}

function colorBordersOfTypingAndLetterBlocks() {
    ALL_LETTERS_SELECTED.push(...LETTER_COMBO_ARR)
    letterBlocks.forEach(block => {
        if (block.innerText !== '')
            block.style.border = '2px solid purple'
    })

    typingLetters.forEach(letter => {
        if (ALL_LETTERS_SELECTED.includes(letter.innerText))
            letter.style.border = '2px solid red'
    })
}

// function resetToDefaultScreen(){

// }

let wordToGuess = getRandomWord()
console.log(wordToGuess)

