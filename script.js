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
let SUCCESS_OR_FAIL_DIALOG_SWITCH = true
const LIST_OF_FIVE_LETTER_WORDS = ["ready", "freed", "frank", "bingo", "hello", "joint", "speak", "drugs", "lined", "index", "break", "burnt", "breed", "creed", "enter", "civil",
    "crews", "hired", "fired", "bread", "tulip", "crest", "tonic", "cruse", "angel", "sheet", "other", "meant", "photo", "phone", "group", "catch", "match", "batch", "hatch", "fetch",
    "patch", "latch", "great", "watch", "cream", "swing", "rings", "bring", "fling", "thing", "sling", "after", "apple", "crush", "makes", "hours", "tails", "house", "whole", "cling",
    "couch", "coach", "relic", "bravo", "delta", "alpha", "micro", "macro", "dealt", "swear", "fates", "faith", "trust", "again", "crust", "since", "model", "props", "earns", "clove",
    "globe", "moods", "money", "rerun", "scene", "scent", "dream", "worse", "close", "smell", "small", "worst", "scrap", "sword", "story", "fight", "begin", "trope", "crops", "limit"]

function getRandomWord() {
    const localStorageWords = JSON.parse(localStorage.getItem('fiveLetterWords')) || []
    const fiveLetterWordsArr = localStorageWords.length > LIST_OF_FIVE_LETTER_WORDS.length
        ? localStorageWords
        : LIST_OF_FIVE_LETTER_WORDS


    const wordToGuess = fiveLetterWordsArr[Math.floor(Math.random() * fiveLetterWordsArr.length)].toUpperCase()
    console.log(wordToGuess)
    return wordToGuess
}

const greenColor = 'rgb(102, 204, 102)'
const yellowColor = 'rgb(255, 234, 118)'
const redColor = 'rgb(205, 92, 92)'

const ALL_LETTERS_WITH_COLORS_OBJ = {}

// function createObjectForLetters() {
//     typingLetters.forEach(letter => {
//         ALL_LETTERS_WITH_COLORS_OBJ[letter.innerText] = red
//     })
// }


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
                    currentRowLetters[i].style.backgroundColor = greenColor
                }
                else if (wordToGuess.split('').includes(currentRowLetters[i].innerText.toUpperCase())) {
                    currentRowLetters[i].style.backgroundColor = yellowColor
                }
                else {
                    currentRowLetters[i].style.backgroundColor = redColor
                }

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
            LETTER_COMBO_ARR.forEach(letter => {
                if (!ALL_LETTERS_WITH_COLORS_OBJ.hasOwnProperty(letter))
                    ALL_LETTERS_WITH_COLORS_OBJ[letter] = redColor
            })
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

function updateLetterColors() {
    for (let i = 0; i < currentRowLetters.length; i++) {
        const letterBackgroundColor = currentRowLetters[i].style.backgroundColor
        if (letterBackgroundColor === greenColor) {
            ALL_LETTERS_WITH_COLORS_OBJ[currentRowLetters[i].innerText] = greenColor
        }
        else if (letterBackgroundColor === yellowColor && ALL_LETTERS_WITH_COLORS_OBJ[currentRowLetters[i].innerText] !== greenColor) {
            ALL_LETTERS_WITH_COLORS_OBJ[currentRowLetters[i].innerText] = yellowColor
        }
        else if (letterBackgroundColor === redColor && ALL_LETTERS_WITH_COLORS_OBJ[currentRowLetters[i].innerText] === redColor) {
            ALL_LETTERS_WITH_COLORS_OBJ[currentRowLetters[i].innerText] = redColor
        } 
    }
}

async function wordleBeingPlayed(fetchedFiveLetterWord) {
    addWordToLocalStorage(fetchedFiveLetterWord)
    await colorInsideOfLetterBlocks()
    updateLetterColors()
    console.log(ALL_LETTERS_WITH_COLORS_OBJ)
    checkIfTheWordIsGuessed(fetchedFiveLetterWord)

    colorBordersOfTypingAndLetterBlocks(redColor)
    currentRowLetters = letterRows[++STARTING_ROW_INDEX] !== undefined
        ? letterRows[STARTING_ROW_INDEX].children
        : letterRows[--STARTING_ROW_INDEX].children

}

function clearTimeoutIds() {
    for (const id of TIMEOUT_IDS) clearTimeout(id)
    TIMEOUT_IDS.length = 0
}

function slideModalFromTop(dialog) {
    dialog.classList.add('slide-from-top-transition')
}
function slideModalToTop(dialog) {
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
        else {
            block.style.border = '2px solid gray'
        }
    })

    typingLetters.forEach(letter => {
        if (ALL_LETTERS_WITH_COLORS_OBJ[letter.innerText] === yellowColor || ALL_LETTERS_WITH_COLORS_OBJ[letter.innerText] === greenColor) {
            const color = ALL_LETTERS_WITH_COLORS_OBJ[letter.innerText] === greenColor
                ? greenColor
                : yellowColor

            letter.style.boxShadow = `0px 0px 5px 1px ${color}`
            letter.style.border = `2px solid ${color}`
        }
        else if (ALL_LETTERS_WITH_COLORS_OBJ[letter.innerText] === redColor) {
            letter.style.boxShadow = `0px 0px 5px 1px ${redColor}`
            letter.style.border = `2px solid ${redColor}`
        }
        else {
            letter.style.boxShadow = '10px 10px 10px rgba(117, 87, 87, 0.1)'
            letter.style.border = '2px solid purple'
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
            currentRowLetters[i].style.border = '2px solid indianred'
            currentRowLetters[i].style.backgroundColor = 'white'
            currentRowLetters[i].style.animation = ''
        }
    }
    while (letterRows[--STARTING_ROW_INDEX] !== undefined)

    STARTING_ROW_INDEX = 0
    for (const key in ALL_LETTERS_WITH_COLORS_OBJ) delete ALL_LETTERS_WITH_COLORS_OBJ[key]
    wordToGuess = getRandomWord()
    await pauseForHowManyMilliseconds(250)
    colorBordersOfTypingAndLetterBlocks()
}

const playAgainButtons = document.querySelectorAll('.play-again-buttons')
playAgainButtons.forEach(button => {
    button.addEventListener('click', () => {
        resetToDefaultScreen()
    })
})

// createObjectForLetters()
let wordToGuess = getRandomWord()

const correctWordForEnding = document.querySelector('#the-correct-word-was-div')
correctWordForEnding.innerText = `Correct word was ${wordToGuess}`

