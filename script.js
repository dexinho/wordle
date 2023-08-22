const dialogForSuccess = document.querySelector('#dialog-for-success')
const dialogForFailure = document.querySelector('#dialog-for-failure')
const letterRows = document.querySelectorAll('.letter-rows')
const letterBlocks = document.querySelectorAll('.letter-blocks')
let STARTING_ROW_INDEX = 0
let currentRowLetters = letterRows[STARTING_ROW_INDEX].children
const typingLetters = document.querySelectorAll('.typing-letters')
const LETTER_COMBO_ARR = []
const TIMEOUT_IDS = []
let FETCH_SWITCH = true
const ALL_LETTERS_SELECTED = []
let SUCCESS_OR_FAIL_DIALOG_SWITCH = true

function getRandomWord() {
    const fiveLetterWordsArr = JSON.parse(localStorage.getItem('fiveLetterWords')) || []
    const wordToGuess = fiveLetterWordsArr[Math.floor(Math.random() * fiveLetterWordsArr.length)].toUpperCase()
    console.log(wordToGuess)
    return wordToGuess
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
            await wordleBeingPlayed(jsonData[0].word)
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

async function wordleBeingPlayed(fetchedFiveLetterWord) {
    // console.log(letterRows[STARTING_ROW_INDEX])
    ALL_LETTERS_SELECTED.push(...LETTER_COMBO_ARR)
    addWordToLocalStorage(fetchedFiveLetterWord)
    await colorInsideOfLetterBlocks()
    checkIfTheWordIsGuessed(fetchedFiveLetterWord)

    colorBordersOfTypingAndLetterBlocks('red')
    currentRowLetters = letterRows[++STARTING_ROW_INDEX] !== undefined
        ? letterRows[STARTING_ROW_INDEX].children
        : letterRows[--STARTING_ROW_INDEX].children

}

function clearTimeoutIds() {
    for (const id of TIMEOUT_IDS) clearTimeout(id)
    TIMEOUT_IDS.length = 0
}

function slideModalFromTop(dialog){
    dialog.classList.add('slide-from-top-transition')
}
function slideModalToTop(dialog){
    dialog.classList.add('slide-to-top-transition')
}

async function checkIfTheWordIsGuessed(word) {
    if (word.toUpperCase() === wordToGuess) {
        await pauseForHowManyMilliseconds(250)
        dialogForSuccess.showModal()
        SUCCESS_OR_FAIL_DIALOG_SWITCH = true
        slideModalFromTop(dialogForSuccess)
    }
    else if (letterRows[STARTING_ROW_INDEX + 1] === undefined) {
        await pauseForHowManyMilliseconds(250)
        dialogForFailure.showModal()
        SUCCESS_OR_FAIL_DIALOG_SWITCH = false
        slideModalFromTop(dialogForFailure)
    }
}

function addWordToLocalStorage(word) {
    const fiveLetterWordsArr = JSON.parse(localStorage.getItem('fiveLetterWords')) || []

    if (!fiveLetterWordsArr.includes(word)) {
        fiveLetterWordsArr.push(word)
        localStorage.setItem('fiveLetterWords', JSON.stringify(fiveLetterWordsArr))
    }
}

function colorBordersOfTypingAndLetterBlocks(color) {
    letterBlocks.forEach(block => {
        if (block.innerText !== '')
            block.style.border = '2px solid purple'
    })
    typingLetters.forEach(letter => {
        if (ALL_LETTERS_SELECTED.includes(letter.innerText)) {
            letter.style.boxShadow = '3px 3px 10px rgba(242, 17, 17, 0.5)'
            letter.style.border = `2px solid ${color}`
        }
        else {
            letter.style.boxShadow = '10px 10px 10px rgba(117, 87, 87, 0.1)'
            letter.style.border = `2px solid purple`
        }
    })
}

async function resetToDefaultScreen() {
    for (const id of TIMEOUT_IDS) clearTimeoutIds(id)
    TIMEOUT_IDS.length = 0

    const successOrFailureModal = SUCCESS_OR_FAIL_DIALOG_SWITCH ? dialogForSuccess : dialogForFailure

    slideModalToTop(successOrFailureModal)
    await pauseForHowManyMilliseconds(500)
    successOrFailureModal.classList.remove('slide-from-top-transition')
    successOrFailureModal.classList.remove('slide-to-top-transition')
    successOrFailureModal.close()

    do {
        currentRowLetters = letterRows[STARTING_ROW_INDEX].children
        for (let i = 0; i < currentRowLetters.length; i++) {
            currentRowLetters[i].style.transition = '0.3s ease-in'
            currentRowLetters[i].innerText = ''
            currentRowLetters[i].style.border = '2px solid gray'
            currentRowLetters[i].style.backgroundColor = 'white'
            currentRowLetters[i].style.animation = ''
        }
    }
    while (letterRows[--STARTING_ROW_INDEX] !== undefined)
    STARTING_ROW_INDEX = 0
    ALL_LETTERS_SELECTED.length = 0
    wordToGuess = getRandomWord()
    await pauseForHowManyMilliseconds(500)
    colorBordersOfTypingAndLetterBlocks()
}

const playAgainButtons = document.querySelectorAll('.play-again-buttons')
playAgainButtons.forEach(button => {
    button.addEventListener('click', () => {
        resetToDefaultScreen()
    })
})

let wordToGuess = getRandomWord()


